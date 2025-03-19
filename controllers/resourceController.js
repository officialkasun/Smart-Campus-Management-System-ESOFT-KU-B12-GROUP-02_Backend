import moment from 'moment-timezone';
import Resource from '../models/Resource.js';
import { getIO } from '../utils/socket.js';

// Add a new resource (admin only)
export const addResource = async (req, res) => {
  const { name, type } = req.body;

  try {
    const existingResource = await Resource.findOne({ name });
    if (existingResource) {
      return res.status(400).json({ message: 'Resource already exists' });
    }

    const resource = await Resource.create({ 
      name, 
      type,
    });

    res.status(201).json(resource);
  } catch (error) {
    console.error('Error adding resource:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

//Real-time search for resources
export const getResourceByName = async (req, res) => {
  try {
    const searchName = req.params.resourceName; 
    console.log('Search Name:', searchName); 

    if (!searchName || typeof searchName !== 'string') {
      return res.status(400).json({ message: 'Invalid resource name' });
    }

    const resources = await Resource.find({
      name: { $regex: searchName, $options: 'i' } 
    });

    if (resources.length === 0) {
      return res.status(404).json({ message: 'No resources found matching this name' });
    }

    res.status(200).json(resources);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Get resources with reservedBy details
export const getResources = async (req, res) => {
  try {
    const resources = await Resource.find().populate('reservedBy', 'name email'); // Populate reservedBy
    res.status(200).json(resources);
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Get all available resources
export const getAvailableResources = async (req, res) => {
  try {
    const limit = parseInt(req.params.limit) || 100;

    const resources = await Resource.find({ availability: true }).limit(limit);

    res.status(200).json(resources);
  } catch (error) {
    console.error('Error fetching available resources:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Helper function to get resource usage analytics data without requiring req/res
export const getResourceUsageAnalyticsData = async () => {
  try {
    // Total number of resources
    const totalResources = await Resource.countDocuments();

    // Total number of reserved resources
    const totalReservedResources = await Resource.countDocuments({ availability: false });

    // Most reserved resources
    const mostReservedResources = await Resource.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Resource utilization percentage
    const resourceUtilization = (totalReservedResources / totalResources) * 100;

    return {
      totalResources,
      totalReservedResources,
      mostReservedResources,
      resourceUtilization: `${resourceUtilization.toFixed(2)}%`,
    };
  } catch (error) {
    console.error('Error fetching resource usage analytics data:', error);
    throw error;
  }
};

// Reserve a resource
export const reserveResource = async (req, res) => {
  const { reservationDate, reservationTime } = req.body;
  const resourceId = req.params.resId;
  const userId = req.user._id;

  try {
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (!resource.availability) {
      return res.status(400).json({ message: 'Resource is already reserved' });
    }

    const formattedTime = reservationTime.length === 5 ? `${reservationTime}:00` : reservationTime; // Add seconds if missing
    const combinedDateTime = `${reservationDate}T${formattedTime}`;

    const colomboTime = moment.tz(combinedDateTime, 'Asia/Colombo');

    const reservationExpiry = colomboTime.clone().add(1, 'day').toDate();

    resource.availability = false;
    resource.reservedBy = userId;
    resource.reservationDate = colomboTime.toDate(); // Save the full date and time
    resource.reservationExpiry = reservationExpiry;
    await resource.save();

    const analytics = await getResourceUsageAnalyticsData();
    const io = getIO();
    io.emit('resourceUpdate', analytics);

    res.status(200).json(resource);
  } catch (error) {
    console.error('Error reserving resource:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Get resource analytics (route handler)
export const getResourceUsageAnalytics = async (req, res) => {
  try {
    const analyticsData = await getResourceUsageAnalyticsData();
    res.status(200).json(analyticsData);
  } catch (error) {
    console.error('Error fetching resource usage analytics:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Update a resource
export const updateResource = async (req, res) => {
  const id = req.params.resId;
  const { name, type } = req.body;

  try {
    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }
    
    if (name) resource.name = name;
    if (type) resource.type = type;

    const updatedResource = await resource.save();
    res.status(200).json(updatedResource);
  } catch (error) {
    console.error("Error updating resource:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Delete a resource
export const deleteResource = async(req,res) => {
  const resourceId = req.params.id;

  try {
    const deletedResource = await Resource.deleteOne({ _id: resourceId });

    if (deletedResource.deletedCount === 0) {
      return res.status(404).json({ message: "Resource not found" });
    }
    res.status(200).json({ message: "Resource deleted successfully" });
  } catch (error) {
    console.error("Error deleting resource:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
import moment from 'moment-timezone';
import Resource from '../models/Resource.js';

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

// Get all resources with reservedBy details
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
    const resources = await Resource.find({ availability: true });
    res.status(200).json(resources);
  } catch (error) {
    console.error('Error fetching available resources:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Reserve a resource
export const reserveResource = async (req, res) => {
  const { resourceId, reservationDate, reservationTime } = req.body;
  const userId = req.user._id; // Use ObjectId

  try {
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (!resource.availability) {
      return res.status(400).json({ message: 'Resource is already reserved' });
    }

    const combinedDateTime = `${reservationDate}T${reservationTime}:00`;

    const colomboTime = moment(combinedDateTime).tz('Asia/Colombo').toISOString();

    const reservationExpiry = new Date(colomboTime);
    reservationExpiry.setDate(reservationExpiry.getDate() + 1);  

    resource.availability = false;
    resource.reservedBy = userId; 
    resource.reservationDate = reservationDate;
    resource.reservationExpiry = reservationExpiry;
    await resource.save();

    // Emit real-time update
    const analytics = await getResourceUsageAnalytics();
    io.emit('resourceUpdate', analytics);

    res.status(200).json(resource);
  } catch (error) {
    console.error('Error reserving resource:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Gwt resource analytics
export const getResourceUsageAnalytics = async (req, res) => {
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

    res.status(200).json({
      totalResources,
      totalReservedResources,
      mostReservedResources,
      resourceUtilization: `${resourceUtilization.toFixed(2)}%`,
    });
  } catch (error) {
    console.error('Error fetching resource usage analytics:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};
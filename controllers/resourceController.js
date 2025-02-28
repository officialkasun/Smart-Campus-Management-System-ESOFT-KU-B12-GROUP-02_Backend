import Resource from '../models/Resource.js';

// Add a new resource (admin only)
export const addResource = async (req, res) => {
  const { name, type } = req.body;

  try {
    const existingResource = await Resource.findOne({ name });
    if (existingResource) {
      return res.status(400).json({ message: 'Resource already exists' });
    }

    const resource = await Resource.create({ name, type });

    res.status(201).json(resource);
  } catch (error) {
    console.error('Error adding resource:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Get all resources with reservedBy details
export const getResources = async (req, res) => {
  try {
    const resources = await Resource.find();

    const populatedResources = await Promise.all(
      resources.map(async (resource) => {
        const reservedBy = await User.findOne({ id: resource.reservedBy }).select('id name email');
        return {
          ...resource.toObject(),
          reservedBy,
        };
      })
    );

    res.status(200).json(populatedResources);
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Reserve a resource
export const reserveResource = async (req, res) => {
  const { resourceId, reservationDate } = req.body;
  const userId = req.user.id; 

  try {
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (!resource.availability) {
      return res.status(400).json({ message: 'Resource is already reserved' });
    }

    resource.availability = false;
    resource.reservedBy = userId;
    resource.reservationDate = reservationDate;
    await resource.save();

    res.status(200).json(resource);
  } catch (error) {
    console.error('Error reserving resource:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

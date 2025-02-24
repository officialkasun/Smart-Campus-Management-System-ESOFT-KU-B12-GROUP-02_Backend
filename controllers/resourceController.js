import Resource from '../models/Resource.js';

// Reserve a resource
export const reserveResource = async (req, res) => {
  const { resourceId, reservationDate } = req.body;

  try {
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (!resource.availability) {
      return res.status(400).json({ message: 'Resource is already reserved' });
    }

    resource.availability = false;
    resource.reservedBy = req.user.id;
    resource.reservationDate = reservationDate;
    await resource.save();

    res.status(200).json(resource);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};
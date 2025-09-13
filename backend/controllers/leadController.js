import Lead from '../models/Lead.js';

export const createLead = async (req, res) => {
  try {
    console.log('Creating lead with data:', req.body);
    
    const leadData = {
      ...req.body,
      // Ensure proper data types
      score: parseInt(req.body.score) || 0,
      lead_value: parseFloat(req.body.lead_value) || 0,
      is_qualified: Boolean(req.body.is_qualified),
      last_activity_at: req.body.last_activity_at ? new Date(req.body.last_activity_at) : null
    };

    const lead = new Lead(leadData);
    await lead.save();
    
    console.log('Lead created successfully:', lead._id);
    res.status(201).json({
      message: 'Lead created successfully',
      data: lead
    });
  } catch (error) {
    console.error('Error creating lead:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'A lead with this email already exists',
        error: 'DUPLICATE_EMAIL'
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation failed',
        error: error.message
      });
    }
    
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

export const getLeads = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    // Build filter query
    const filterQuery = {};
    
    // String filters
    if (req.query.email) {
      if (req.query.email_op === 'contains') {
        filterQuery.email = { $regex: req.query.email, $options: 'i' };
      } else {
        filterQuery.email = req.query.email;
      }
    }
    
    if (req.query.company) {
      if (req.query.company_op === 'contains') {
        filterQuery.company = { $regex: req.query.company, $options: 'i' };
      } else {
        filterQuery.company = req.query.company;
      }
    }
    
    if (req.query.city) {
      if (req.query.city_op === 'contains') {
        filterQuery.city = { $regex: req.query.city, $options: 'i' };
      } else {
        filterQuery.city = req.query.city;
      }
    }
    
    // Enum filters
    if (req.query.status) {
      filterQuery.status = req.query.status;
    }
    
    if (req.query.source) {
      filterQuery.source = req.query.source;
    }
    
    // Number filters
    if (req.query.score) {
      filterQuery.score = parseInt(req.query.score);
    }
    
    if (req.query.lead_value) {
      filterQuery.lead_value = parseFloat(req.query.lead_value);
    }
    
    // Boolean filter
    if (req.query.is_qualified !== undefined) {
      filterQuery.is_qualified = req.query.is_qualified === 'true';
    }
    
    console.log('Filter query:', filterQuery);
    console.log('Pagination:', { page, limit, skip });
    
    const leads = await Lead.find(filterQuery)
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });
    
    const total = await Lead.countDocuments(filterQuery);
    
    console.log(`Found ${leads.length} leads, total: ${total}`);
    
    res.status(200).json({
      data: leads,
      page: parseInt(page),
      limit: parseInt(limit),
      total: total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

export const getLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    
    if (!lead) {
      return res.status(404).json({
        message: 'Lead not found'
      });
    }
    
    res.status(200).json({
      message: 'Lead found',
      data: lead
    });
  } catch (error) {
    console.error('Error fetching lead:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid lead ID format'
      });
    }
    
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

export const updateLead = async (req, res) => {
  try {
    const leadData = {
      ...req.body,
      score: parseInt(req.body.score) || 0,
      lead_value: parseFloat(req.body.lead_value) || 0,
      is_qualified: Boolean(req.body.is_qualified),
      last_activity_at: req.body.last_activity_at ? new Date(req.body.last_activity_at) : null
    };
    
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      leadData,
      { new: true, runValidators: true }
    );
    
    if (!lead) {
      return res.status(404).json({
        message: 'Lead not found'
      });
    }
    
    console.log('Lead updated successfully:', lead._id);
    res.status(200).json({
      message: 'Lead updated successfully',
      data: lead
    });
  } catch (error) {
    console.error('Error updating lead:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'A lead with this email already exists',
        error: 'DUPLICATE_EMAIL'
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation failed',
        error: error.message
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid lead ID format'
      });
    }
    
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

export const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    
    if (!lead) {
      return res.status(404).json({
        message: 'Lead not found'
      });
    }
    
    console.log('Lead deleted successfully:', lead._id);
    res.status(200).json({
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting lead:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid lead ID format'
      });
    }
    
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

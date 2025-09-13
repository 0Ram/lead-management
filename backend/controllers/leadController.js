import Lead from '../models/Lead.js';
import mongoose from 'mongoose';

const createLead = async (req, res) => {
  try {
    const { first_name, last_name, email } = req.body;
    
    if (!first_name || !last_name || !email) {
      return res.status(400).json({ 
        message: 'First name, last name, and email are required'
      });
    }

    const leadData = {
      ...req.body,
      score: parseInt(req.body.score) || 0,
      lead_value: parseFloat(req.body.lead_value) || 0,
      is_qualified: req.body.is_qualified === true || req.body.is_qualified === 'true',
      last_activity_at: req.body.last_activity_at ? new Date(req.body.last_activity_at) : null
    };

    const lead = new Lead(leadData);
    await lead.save();
    
    res.status(201).json(lead);
  } catch (error) {
    console.error('Create lead error:', error);
    
    if (error.code === 11000 && error.keyValue?.email) {
      return res.status(400).json({ 
        message: 'A lead with this email already exists'
      });
    }
    
    res.status(500).json({ 
      message: 'Server error while creating lead',
      error: error.message
    });
  }
};

const getLeads = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    let filter = {};
    
    // String fields (email, company, city) - equals, contains
    if (req.query.email) {
      if (req.query.email_op === 'contains') {
        filter.email = { $regex: req.query.email, $options: 'i' };
      } else {
        filter.email = req.query.email;
      }
    }
    
    if (req.query.company) {
      if (req.query.company_op === 'contains') {
        filter.company = { $regex: req.query.company, $options: 'i' };
      } else {
        filter.company = req.query.company;
      }
    }
    
    if (req.query.city) {
      if (req.query.city_op === 'contains') {
        filter.city = { $regex: req.query.city, $options: 'i' };
      } else {
        filter.city = req.query.city;
      }
    }

    // Enums (status, source) - equals, in
    if (req.query.status) {
      if (req.query.status_op === 'in') {
        filter.status = { $in: req.query.status.split(',') };
      } else {
        filter.status = req.query.status;
      }
    }
    
    if (req.query.source) {
      if (req.query.source_op === 'in') {
        filter.source = { $in: req.query.source.split(',') };
      } else {
        filter.source = req.query.source;
      }
    }

    // Numbers (score, lead_value) - equals, gt, lt, between
    if (req.query.score) {
      if (req.query.score_op === 'gt') {
        filter.score = { $gt: parseInt(req.query.score) };
      } else if (req.query.score_op === 'lt') {
        filter.score = { $lt: parseInt(req.query.score) };
      } else if (req.query.score_op === 'between' && req.query.score_to) {
        filter.score = { $gte: parseInt(req.query.score), $lte: parseInt(req.query.score_to) };
      } else {
        filter.score = parseInt(req.query.score);
      }
    }
    
    if (req.query.lead_value) {
      if (req.query.lead_value_op === 'gt') {
        filter.lead_value = { $gt: parseFloat(req.query.lead_value) };
      } else if (req.query.lead_value_op === 'lt') {
        filter.lead_value = { $lt: parseFloat(req.query.lead_value) };
      } else if (req.query.lead_value_op === 'between' && req.query.lead_value_to) {
        filter.lead_value = { $gte: parseFloat(req.query.lead_value), $lte: parseFloat(req.query.lead_value_to) };
      } else {
        filter.lead_value = parseFloat(req.query.lead_value);
      }
    }

    // Dates (created_at, last_activity_at) - on, before, after, between
    if (req.query.created_at) {
      if (req.query.created_at_op === 'before') {
        filter.createdAt = { $lt: new Date(req.query.created_at) };
      } else if (req.query.created_at_op === 'after') {
        filter.createdAt = { $gt: new Date(req.query.created_at) };
      } else if (req.query.created_at_op === 'between' && req.query.created_at_to) {
        filter.createdAt = { $gte: new Date(req.query.created_at), $lte: new Date(req.query.created_at_to) };
      } else {
        const date = new Date(req.query.created_at);
        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + 1);
        filter.createdAt = { $gte: date, $lt: nextDay };
      }
    }
    
    if (req.query.last_activity_at) {
      if (req.query.last_activity_at_op === 'before') {
        filter.last_activity_at = { $lt: new Date(req.query.last_activity_at) };
      } else if (req.query.last_activity_at_op === 'after') {
        filter.last_activity_at = { $gt: new Date(req.query.last_activity_at) };
      } else if (req.query.last_activity_at_op === 'between' && req.query.last_activity_at_to) {
        filter.last_activity_at = { $gte: new Date(req.query.last_activity_at), $lte: new Date(req.query.last_activity_at_to) };
      } else {
        const date = new Date(req.query.last_activity_at);
        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + 1);
        filter.last_activity_at = { $gte: date, $lt: nextDay };
      }
    }

    // Boolean (is_qualified) - equals
    if (req.query.is_qualified !== undefined) {
      filter.is_qualified = req.query.is_qualified === 'true';
    }

    // Get total count
    const total = await Lead.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    // Get leads
    const leads = await Lead.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Return in required format
    res.status(200).json({
       leads,
      page,
      limit,
      total,
      totalPages
    });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching leads',
      error: error.message
    });
  }
};

const getLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ 
        message: 'Lead not found'
      });
    }
    res.status(200).json(lead);
  } catch (error) {
    console.error('Get lead error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching lead',
      error: error.message
    });
  }
};

const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    if (!lead) {
      return res.status(404).json({ 
        message: 'Lead not found'
      });
    }
    
    res.status(200).json(lead);
  } catch (error) {
    console.error('Update lead error:', error);
    
    if (error.code === 11000 && error.keyValue?.email) {
      return res.status(400).json({ 
        message: 'A lead with this email already exists'
      });
    }
    
    res.status(500).json({ 
      message: 'Server error while updating lead',
      error: error.message
    });
  }
};

const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) {
      return res.status(404).json({ 
        message: 'Lead not found'
      });
    }
    res.status(200).json({ 
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    console.error('Delete lead error:', error);
    res.status(500).json({ 
      message: 'Server error while deleting lead',
      error: error.message
    });
  }
};

export { createLead, getLeads, getLead, updateLead, deleteLead };
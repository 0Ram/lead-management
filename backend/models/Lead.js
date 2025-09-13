import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [100, 'First name cannot exceed 100 characters']
  },
  last_name: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [100, 'Last name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  company: {
    type: String,
    trim: true,
    maxlength: [200, 'Company name cannot exceed 200 characters']
  },
  city: {
    type: String,
    trim: true,
    maxlength: [100, 'City name cannot exceed 100 characters']
  },
  state: {
    type: String,
    trim: true,
    maxlength: [100, 'State name cannot exceed 100 characters']
  },
  source: {
    type: String,
    enum: {
      values: ['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other'],
      message: 'Source must be one of: website, facebook_ads, google_ads, referral, events, other'
    },
    default: 'website'
  },
  status: {
    type: String,
    enum: {
      values: ['new', 'contacted', 'qualified', 'lost', 'won'],
      message: 'Status must be one of: new, contacted, qualified, lost, won'
    },
    default: 'new'
  },
  score: {
    type: Number,
    min: [0, 'Score must be at least 0'],
    max: [100, 'Score cannot exceed 100'],
    default: 0
  },
  lead_value: {
    type: Number,
    min: [0, 'Lead value cannot be negative'],
    default: 0
  },
  last_activity_at: {
    type: Date,
    default: null
  },
  is_qualified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Add indexes for better performance
leadSchema.index({ email: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ source: 1 });
leadSchema.index({ createdAt: -1 });

// Handle duplicate email error
leadSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    next(new Error('A lead with this email already exists'));
  } else {
    next(error);
  }
});

export default mongoose.model('Lead', leadSchema);
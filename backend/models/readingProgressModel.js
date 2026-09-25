import mongoose from "mongoose";

const highlightSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: '#FFFF5C'
  },
  startOffset: {
    type: Number
  },
  endOffset: {
    type: Number
  },
  page: {
    type: Number
  },
  cfiRange: {
    type: String
  },
  note: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const bookmarkSchema = new mongoose.Schema({
  page: {
    type: Number
  },
  cfi: {
    type: String
  },
  label: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const annotationSchema = new mongoose.Schema({
  page: {
    type: Number
  },
  cfi: {
    type: String
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['note', 'comment', 'question'],
    default: 'note'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const readingProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true
    },

    // Progress tracking
    currentPage: {
      type: Number,
      default: 1
    },
    currentCfi: {
      type: String,
      default: null
    },
    currentPosition: {
      type: Number,
      default: 0
    },
    totalPages: {
      type: Number,
      default: 0
    },

    // User data
    bookmarks: [bookmarkSchema],
    highlights: [highlightSchema],
    annotations: [annotationSchema],

    // Reading stats
    lastReadAt: {
      type: Date,
      default: Date.now
    },
    totalReadingTime: {
      type: Number,
      default: 0
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date,
      default: null
    },

    // Display preferences (per book)
    preferences: {
      fontSize: {
        type: Number,
        default: 16
      },
      theme: {
        type: String,
        enum: ['light', 'dark', 'sepia'],
        default: 'dark'
      },
      fontFamily: {
        type: String,
        default: 'default'
      }
    }
  },
  { timestamps: true }
);

// Compound unique index
readingProgressSchema.index({ userId: 1, bookId: 1 }, { unique: true });
readingProgressSchema.index({ userId: 1, lastReadAt: -1 });

export default mongoose.model("ReadingProgress", readingProgressSchema);

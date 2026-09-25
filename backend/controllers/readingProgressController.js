import ReadingProgress from "../models/readingProgressModel.js";
import Book from "../models/bookModel.js";

// GET /api/books/progress/:bookId - Get user's progress for a book
export const getReadingProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { bookId } = req.params;

    let progress = await ReadingProgress.findOne({ userId, bookId });

    if (!progress) {
      // Create new progress entry
      progress = new ReadingProgress({
        userId,
        bookId,
        currentPage: 1,
        currentPosition: 0
      });
      await progress.save();
    }

    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/books/progress/:bookId - Update reading progress
export const updateReadingProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { bookId } = req.params;
    const {
      currentPage,
      currentCfi,
      currentPosition,
      totalPages,
      totalReadingTime,
      isCompleted,
      preferences
    } = req.body;

    const updateData = {
      lastReadAt: new Date()
    };

    if (currentPage !== undefined) updateData.currentPage = currentPage;
    if (currentCfi !== undefined) updateData.currentCfi = currentCfi;
    if (currentPosition !== undefined) updateData.currentPosition = currentPosition;
    if (totalPages !== undefined) updateData.totalPages = totalPages;
    if (totalReadingTime !== undefined) updateData.totalReadingTime = totalReadingTime;
    if (isCompleted !== undefined) {
      updateData.isCompleted = isCompleted;
      if (isCompleted) updateData.completedAt = new Date();
    }
    if (preferences) updateData.preferences = preferences;

    const progress = await ReadingProgress.findOneAndUpdate(
      { userId, bookId },
      { $set: updateData },
      { new: true, upsert: true }
    );

    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/books/progress/:bookId/bookmark - Add bookmark
export const addBookmark = async (req, res) => {
  try {
    const userId = req.user._id;
    const { bookId } = req.params;
    const { page, cfi, label } = req.body;

    const progress = await ReadingProgress.findOneAndUpdate(
      { userId, bookId },
      {
        $push: {
          bookmarks: { page, cfi, label, createdAt: new Date() }
        },
        $set: { lastReadAt: new Date() }
      },
      { new: true, upsert: true }
    );

    res.json({ success: true, bookmarks: progress.bookmarks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/books/progress/:bookId/bookmark/:bookmarkId - Remove bookmark
export const removeBookmark = async (req, res) => {
  try {
    const userId = req.user._id;
    const { bookId, bookmarkId } = req.params;

    const progress = await ReadingProgress.findOneAndUpdate(
      { userId, bookId },
      { $pull: { bookmarks: { _id: bookmarkId } } },
      { new: true }
    );

    res.json({ success: true, bookmarks: progress?.bookmarks || [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/books/progress/:bookId/highlight - Add highlight
export const addHighlight = async (req, res) => {
  try {
    const userId = req.user._id;
    const { bookId } = req.params;
    const { text, color, page, startOffset, endOffset, cfiRange, note } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Texte requis" });
    }

    const progress = await ReadingProgress.findOneAndUpdate(
      { userId, bookId },
      {
        $push: {
          highlights: {
            text,
            color: color || '#FFFF5C',
            page,
            startOffset,
            endOffset,
            cfiRange,
            note,
            createdAt: new Date()
          }
        },
        $set: { lastReadAt: new Date() }
      },
      { new: true, upsert: true }
    );

    res.json({ success: true, highlights: progress.highlights });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/books/progress/:bookId/highlight/:highlightId - Update highlight note
export const updateHighlight = async (req, res) => {
  try {
    const userId = req.user._id;
    const { bookId, highlightId } = req.params;
    const { note, color } = req.body;

    const progress = await ReadingProgress.findOne({ userId, bookId });
    if (!progress) {
      return res.status(404).json({ message: "Progression non trouvée" });
    }

    const highlight = progress.highlights.id(highlightId);
    if (!highlight) {
      return res.status(404).json({ message: "Surlignage non trouvé" });
    }

    if (note !== undefined) highlight.note = note;
    if (color) highlight.color = color;

    await progress.save();

    res.json({ success: true, highlights: progress.highlights });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/books/progress/:bookId/highlight/:highlightId - Remove highlight
export const removeHighlight = async (req, res) => {
  try {
    const userId = req.user._id;
    const { bookId, highlightId } = req.params;

    const progress = await ReadingProgress.findOneAndUpdate(
      { userId, bookId },
      { $pull: { highlights: { _id: highlightId } } },
      { new: true }
    );

    res.json({ success: true, highlights: progress?.highlights || [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/books/progress/:bookId/annotation - Add annotation
export const addAnnotation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { bookId } = req.params;
    const { page, cfi, content, type } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Contenu requis" });
    }

    const progress = await ReadingProgress.findOneAndUpdate(
      { userId, bookId },
      {
        $push: {
          annotations: {
            page,
            cfi,
            content,
            type: type || 'note',
            createdAt: new Date()
          }
        },
        $set: { lastReadAt: new Date() }
      },
      { new: true, upsert: true }
    );

    res.json({ success: true, annotations: progress.annotations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/books/progress/:bookId/annotation/:annotationId - Update annotation
export const updateAnnotation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { bookId, annotationId } = req.params;
    const { content, type } = req.body;

    const progress = await ReadingProgress.findOne({ userId, bookId });
    if (!progress) {
      return res.status(404).json({ message: "Progression non trouvée" });
    }

    const annotation = progress.annotations.id(annotationId);
    if (!annotation) {
      return res.status(404).json({ message: "Annotation non trouvée" });
    }

    if (content) annotation.content = content;
    if (type) annotation.type = type;

    await progress.save();

    res.json({ success: true, annotations: progress.annotations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/books/progress/:bookId/annotation/:annotationId - Remove annotation
export const removeAnnotation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { bookId, annotationId } = req.params;

    const progress = await ReadingProgress.findOneAndUpdate(
      { userId, bookId },
      { $pull: { annotations: { _id: annotationId } } },
      { new: true }
    );

    res.json({ success: true, annotations: progress?.annotations || [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/books/user/reading-history - Get user's reading history
export const getReadingHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 10 } = req.query;

    const history = await ReadingProgress.find({ userId })
      .populate({
        path: 'bookId',
        select: 'title author coverImage fileType status isPublic',
        match: { status: 'approved', isPublic: true }
      })
      .sort({ lastReadAt: -1 })
      .limit(parseInt(limit));

    // Filter out entries where book was deleted or not approved
    const filteredHistory = history.filter(h => h.bookId !== null);

    res.json({ success: true, history: filteredHistory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/books/user/stats - Get user's reading stats
export const getUserReadingStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const [
      totalBooksRead,
      completedBooks,
      totalHighlights,
      totalBookmarks,
      totalReadingTime
    ] = await Promise.all([
      ReadingProgress.countDocuments({ userId }),
      ReadingProgress.countDocuments({ userId, isCompleted: true }),
      ReadingProgress.aggregate([
        { $match: { userId } },
        { $project: { count: { $size: '$highlights' } } },
        { $group: { _id: null, total: { $sum: '$count' } } }
      ]),
      ReadingProgress.aggregate([
        { $match: { userId } },
        { $project: { count: { $size: '$bookmarks' } } },
        { $group: { _id: null, total: { $sum: '$count' } } }
      ]),
      ReadingProgress.aggregate([
        { $match: { userId } },
        { $group: { _id: null, total: { $sum: '$totalReadingTime' } } }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        totalBooksRead,
        completedBooks,
        totalHighlights: totalHighlights[0]?.total || 0,
        totalBookmarks: totalBookmarks[0]?.total || 0,
        totalReadingTime: totalReadingTime[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

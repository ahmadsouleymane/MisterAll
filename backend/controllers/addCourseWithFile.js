export const addCourseWithFile = async (req, res) => {
  try {
    const { title, subject, user_id, creation } = req.body;
    let attachment = null;

    if (req.file) {
      attachment = `/uploads/${req.file.filename}`; // chemin pour accéder au fichier
    }

    const newCourse = new CourseModel({
      title,
      subject,
      user_id,
      creation,
      attachment,
    });

    const savedCourse = await newCourse.save();

    res.json({
      message: "Cours ajouté avec succès",
      course: savedCourse,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};



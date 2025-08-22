const Project = require("../models/projects");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.createProject = async (req, res) => {
  try {
    let image = "";
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      image = result.secure_url;
    }

    // Check if a project with the same iid already exists
    const existingProject = await Project.findOne({ iid: req.body.iid });
    if (existingProject) {
      return res
        .status(400)
        .json({ message: "A project with this ID already exists" });
    }

    const project = new Project({
      iid: req.body.iid,
      image,
    });

    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProjectByIid = async (req, res) => {
  try {
    const project = await Project.findOne({ iid: req.params.iid });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    let updateData = {};

    // Only update iid if provided
    if (req.body.iid) {
      // Check if another project with the same iid already exists (excluding the current one)
      const existingProject = await Project.findOne({
        iid: req.body.iid,
        _id: { $ne: req.params.id },
      });

      if (existingProject) {
        return res
          .status(400)
          .json({ message: "A project with this ID already exists" });
      }

      updateData.iid = req.body.iid;
    }

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      updateData.image = result.secure_url;
    }

    const project = await Project.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

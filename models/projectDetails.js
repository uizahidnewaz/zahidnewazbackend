const mongoose = require("mongoose");

const projectDetailsSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    headingName: {
      type: String,
      required: true,
      trim: true,
    },
    mainImage: {
      type: String,
      default: "",
    },
    mainImagePublicId: {
      type: String,
      default: "",
    },
    background: {
      title: {
        type: String,
        default: "",
      },
      backgroundList: [String],
    },
    role: {
      title: {
        type: String,
        default: "",
      },
      roleList: [String],
    },
    findingProblem: {
      title: {
        type: String,
        default: "",
      },
      findingProblemList: [String],
      secondTitle: {
        type: String,
        default: "",
      },
      seconddescription: {
        type: String,
        default: "",
      },
    },
    oldDesign: {
      oldDesignTitle: {
        type: String,
        default: "",
      },
      images: [String],
    },
    research: {
      title: {
        type: String,
        default: "",
      },
      researchList: [String],
      secondTitle: {
        type: String,
        default: "",
      },
      secondResearchList: [String],
    },
    definingProblem: {
      title: {
        type: String,
        default: "",
      },
      defineProblemList: [
        {
          leftSide: {
            type: String,
            default: "",
          },
          rightSide: {
            type: String,
            default: "",
          },
        },
      ],
    },
    ideation: {
      ideationTitle: {
        type: String,
        default: "",
      },
      ideationList: [String],
    },
    redisgn: {
      title: {
        type: String,
        default: "",
      },
      redisgnImageList: [String],
    },
    keytakeways: {
      title: {
        type: String,
        default: "",
      },
      desciption: {
        type: String,
        default: "",
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add a pre-save hook to log saving operations
projectDetailsSchema.pre("save", function (next) {
  console.log("Saving project details with heading name:", this.headingName);
  next();
});

// Add indexes to improve query performance
projectDetailsSchema.index({ projectId: 1 });
projectDetailsSchema.index({ headingName: 1 });

const ProjectDetails = mongoose.model("ProjectDetails", projectDetailsSchema);

module.exports = ProjectDetails;

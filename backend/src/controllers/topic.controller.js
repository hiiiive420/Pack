import Topic from "../models/Topic.js";
import { logAction } from "../utils/auditLogger.js";

// CREATE TOPIC
export const createTopic = async (req, res) => {
  try {
    const { topicCode, topicName } = req.body;

    if (!topicCode || !topicName) {
      return res.status(400).json({
        message: "Topic code and name are required"
      });
    }

    const exists = await Topic.findOne({ topicCode });
    if (exists) {
      return res.status(400).json({
        message: "Topic already exists"
      });
    }

    const topic = await Topic.create({ topicCode, topicName });

    await logAction({
      req,
      action: "CREATE",
      module: "TOPIC",
      recordId: topic.topicCode,
      newData: topic,
      description: "Topic created"
    });

    res.status(201).json({ message: "Topic created", topic });
  } catch (err) {
    console.error("CREATE TOPIC ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ GET TOPICS (RESTORED)
export const getTopics = async (req, res) => {
  const topics = await Topic.find({ isActive: true }).sort({
    topicCode: 1
  });
  res.json(topics);
};

// UPDATE TOPIC
export const updateTopic = async (req, res) => {
  const { topicName } = req.body;

  const oldTopic = await Topic.findById(req.params.id).lean();

  const topic = await Topic.findByIdAndUpdate(
    req.params.id,
    { topicName },
    { new: true }
  );

  await logAction({
    req,
    action: "UPDATE",
    module: "TOPIC",
    recordId: topic.topicCode,
    oldData: oldTopic,
    newData: topic,
    description: "Topic updated"
  });

  res.json(topic);
};

// DISABLE TOPIC
export const disableTopic = async (req, res) => {
  const topic = await Topic.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  await logAction({
    req,
    action: "DELETE",
    module: "TOPIC",
    recordId: topic.topicCode,
    description: "Topic disabled"
  });

  res.json({ message: "Topic disabled" });
};

const express = require("express");
const bodyParser = require("body-parser");
const { randomBytes } = require("crypto");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(bodyParser.json());
const PORT = 4001;

const commentsByPostId = {};

app.get("/posts/:id/comments", (req, res) => {
  res.send(commentsByPostId[req.params.id] || []);
});

app.post("/posts/:id/comments", async (req, res) => {
  const commentId = randomBytes(4).toString("hex");
  const { content } = req.body;

  const comments = commentsByPostId[req.params.id] || [];

  comments.push({ id: commentId, content, status: "pending" });
  commentsByPostId[req.params.id] = comments;

  await axios
    .post("http://event-bus-srv:4005/events", {
      type: "CommentCreated",
      data: {
        id: commentId,
        content,
        postId: req.params.id,
        status: "pending",
      },
    })
    .catch((err) => {
      console.log(err.message);
    });

  res.status(201).send(comments);
});

app.post("/events", async (req, res) => {
  const { type, data } = req.body;

  if (type === "CommentModerated") {
    const {postId, id, status, content} = data;
    const comments = commentsByPostId[postId];
    
    const comment = comments.find(comment=>{
        return comment.id === id
    })
    comment.status = status;
    console.log(data);
    await axios.post("http://event-bus-srv:4005/events",{
        type:"CommentUpdated",
        data:{
            id,
            content,
            postId,
            status
        }
    })
  }
  res.status(200).send({});
});

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});

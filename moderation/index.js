const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

app.post('/events', async (req, res)=>{
    console.log('received comment moderation');
    const {type, data} = req.body;
    if(type === 'CommentCreated'){
        const status = data.content
        .includes('orange') ? 'rejected':'approved';
        console.log("reached here");
        console.log(status);
        await axios.post('http://event-bus-srv:4005/events',{
            type: 'CommentModerated',
            data: {
                id: data.id,
                postId: data.postId,
                status,
                content: data.content
            }
        }).catch((err)=>{
            console.log(err.message);
        })
    
        res.status(200).send({});
    }


})

app.listen(4003,()=>{
    console.log("Moderation service listening at 4003")
})
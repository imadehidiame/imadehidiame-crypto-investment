// lib/socket.ts
import { Server as SocketIOServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { MessageThread, pubClient, subClient } from './redis';
import Message from '@/models/Message';
import mongoose, { Types } from 'mongoose';
import { connectToDatabase } from './mongodb';
import User from '@/models/User';
//import Message from '@/models/Message'; 

let io: SocketIOServer;

async function send_message(data:any){
  await connectToDatabase();
  let returned:{data?:{published:any,channel:string}[],published?:MessageThread|any,channel?:string} = {};
  if(data.hasOwnProperty('flag')){
    const date = new Date(typeof data.date === 'string' ? parseInt(data.date) : data.date);
    const flag = data.flag;
    const is_user:boolean = data.is_user;
    //let returned = [];
    if(flag == 'close_chat'){
      await Message.findByIdAndDelete(new mongoose.Types.ObjectId(data.id as string));
      const channel = `livechat:${data.user_id}`;
      const admin_channel = `livechat:system`;
      /*await publish_message(channel,{
          id:form_data.id,
          close:true
      });
      await publish_message(admin_channel,{
          id:form_data.id,
          close:true
      });*/
    returned = {
      data:[
      {
        published:{
          id:data.id,
          close:true
        },
        channel
      },
      {
        published:{
          id:data.id,
          close:true
        },
        channel:admin_channel
      }
  ]};
  //log(message,'Sent edited Message');
  //return Response.json({data:{data:{},logged:true}},{headers:{'Content-Type':'application/json'}});
  }
   else if(flag === 'new'){
      if(!is_user){
        const message = await Message.create({
          userId:new mongoose.Types.ObjectId(data.user_id as string),
          read: false,
          admin_read: true, 
          createdAt:date,
          updatedAt:date,
          subject:data.newMessageSubject,
          messages:[
          {
              id:data.inner_id,
              sender:'System',
              timestamp: date,
              content: data.newMessageContent
          }
          ]
      });
      const channel = `livechat:${data.user_id}`;
      //Query for all admins that are not this particular admin and post to them too
      const message_data:MessageThread = {
        user: {
          id:data.user_id,
          name:data.name
        },
        id:`${message._id.toString()}`,
        read: false,
        subject:data.newMessageSubject,
        timestamp:date,
        updatedAt:date,
        admin_read:true,
        is_new:true,
        userId: data.user_id,
        messages:[
          {
              id:data.inner_id,
              sender: 'System',
              timestamp: date,
              content:data.newMessageContent
          }
          ]
      }
      const userIds = await User.find(
        {
          role: 'admin',
          _id: { $ne: new Types.ObjectId(data.userId as string)}
        },
        { _id: 1 }  
      )
        .lean();
      const sent_ids = userIds.map(e=>{
          const id = typeof e === 'string' ? e : e.toString();
          return {published:message_data,channel:`livechat:${id}`};
      })
      returned = {
        published:message_data,
        data:[{published:{id:`${message._id.toString()}`,is_new_id:true,old_id:data.inner_id},channel:`livechat:${data.userId}`},
          ...sent_ids
        ],
        channel
      };
      return returned;
      }
        const message = await Message.create({
            userId:new mongoose.Types.ObjectId(data.user?._id as string),
            read: is_user ? true : false,
            admin_read: is_user ? false : true, 
            createdAt:date,
            updatedAt:date, 
            subject:data.newMessageSubject,
            messages:[
            {
                id:data.inner_id,
                sender:data.user?.name,
                timestamp: date,
                content: data.newMessageContent
            }
            ]
        });
        const channel = is_user ? `livechat:system` : `livechat:${data.user._id}`;
        const message_data:MessageThread = {
          user:is_user ? {
            id:data.user?._id,
            name:data.user?.name as string
          }: {
            id:data.user_id,
            name:data.user.name
          },
          id:`${message._id.toString()}`,
          read:is_user ? true : false,
          subject:data.newMessageSubject,
          timestamp:date,
          updatedAt:date,
          admin_read:is_user ? false : true,
          is_new:true,
          userId: is_user ? data.user?._id : data.user_id,
          messages:[
            {
                id:data.inner_id,
                sender: is_user ? data.user?.name as string : 'System',
                timestamp: date,
                content: data.newMessageContent
            }
            ]
        }
        returned = {
          published:message_data,
          data:[{published:{id:`${message._id.toString()}`,is_new_id:true,old_id:data.inner_id},channel:`livechat:${data.user._id}`}],
          channel
        };
        //await publish_message(channel,message_data);
        
        //return Response.json({data:{data:{id:`${message._id.toString()}`},logged:true}});
    }else if(flag === 'update'){
        //log(form_data.id,'Form data ID for unpdate');
        await Message.findByIdAndUpdate(new mongoose.Types.ObjectId(data.id as string),{
            read:is_user ? true : false,
            admin_read:is_user ? false : true,
            updatedAt:date,
            '$push':{
                messages:{
                    id:data.inner_id,
                    sender: is_user ? data.user?.name as string : 'System',
                    timestamp:date,
                    content:data.newMessageContent
                }
            }
        },
        {new:true}
    );
    //livechat:system
    const channel = is_user ? `livechat:system` : `livechat:${data.user_id}`;
        const message_data:MessageThread = {
          id:data.id,
          read:is_user ? true : false,
          subject:data.newMessageSubject || '',
          timestamp:date,
          updatedAt:date,
          admin_read:is_user ? false : true,
          is_new:false,
          userId: is_user ? data.user?._id.toString() : data.user_id,
          messages:[
            {
                id:data.inner_id,
                sender: is_user ? data.user?.name as string : 'System',
                timestamp: date,
                content: data.newMessageContent
            }
            ]
        }
        //console.log({message_data});
        //await publish_message(channel,message_data);
        returned = {published:message_data,channel};
    //log(message,'Sent edited Message');
    //return Response.json({data:{data:{},logged:true}},{headers:{'Content-Type':'application/json'}});

    
  }else if(flag === 'update_read'){
    //log(form_data.id,'Form data ID for unpdate');
    is_user ? 
    await Message.findByIdAndUpdate(new mongoose.Types.ObjectId(data.id as string),{
        read:true,
        //updatedAt:date,
    },
    {new:true}
    ) : 
    await Message.findByIdAndUpdate(new mongoose.Types.ObjectId(data.id as string),{
      admin_read:true,
      //updatedAt:date,
    },
    {new:true}
  );
  //returned = {logged:true,data:{},flag};
  //return Response.json({data:{data:{},logged:true}});
}
    else if(flag == 'get'){
      console.log('GET flag called');
        const channel = is_user ? 'livechat:'+data.user?._id as string :  'livechat:'+data.userId as string;
        const date = new Date(typeof data.date === 'string' ? parseInt(data.date) : data.date)
        if(!is_user){
          //console.log('I got here');
          const messages = await Message.find(
            {}, // Empty filter to get all messages
            { subject: 1, read: 1, messages: 1, admin_read:1 , updatedAt: 1, _id: 1, userId: 1 } // Select fields
          )
            .populate('userId', 'name _id') // Populate userId with name and _id
            //.lean() // Convert to plain JavaScript objects for easier manipulation
            .exec();
        
            //const users_data = (await User.find({role:'user'},{_id:1,name:1})).map(({_id,name})=>({id:_id.toString(),name}));
          
          const formattedMessages = messages.map((message) => ({
        
            /**
             id: number | string;
          subject: string;
          is_new?:boolean;
          user?:{
            id:string,
            name:string,
          },
          timestamp: Date;
          read?: boolean;
          admin_read?: boolean;
          updatedAt: Date;
          messages: Message[];
          isDraft?: boolean;
          draft?: string;
             */
        
            id: message._id.toString(), // Convert message _id to string
            subject: message.subject,
            read: message.read,
            admin_read:message.admin_read,
            updatedAt: message.updatedAt,
            messages: message.messages.map((e:any) => ({
              id: e.id.toString(),
              sender: e.sender,
              content: e.content,
              timestamp: e.timestamp,
            })), 
            timestamp: message.updatedAt,
            user: {
              id: message.userId._id.toString(), // Convert userId._id to string
              name: message.userId.name, // Include user name
            },
          })) as unknown as MessageThread[];
          returned = {data:[{published:{messages:formattedMessages,all_messages:true},channel}]};
          return returned;
        }
        const messagesFiltered = await Message.aggregate([
            {
              $match: {
                'messages': {
                  $elemMatch: {
                    timestamp: { $gt: date },
                  },
                },
                'userId':new mongoose.Types.ObjectId(data.user?._id as string)
              },
            },
            
            {
              $project: {
                _id: 1,
                //userId: 1,
                subject: 1,
                read: 1,
                createdAt: 1,
                updatedAt: 1,
                messages: {
                  $filter: {
                    input: '$messages',
                    as: 'message',
                    cond: { $gt: ['$$message.timestamp', date] },
                  },
                },
              },
            },
          ]);

          const published = messagesFiltered.map(({_id,subject,read,updatedAt,messages})=>({id:_id.toString(),timestamp:updatedAt,read,subject,messages,updatedAt}));

          returned = {data:[{published:{messages:published,all_messages:true},channel}]};
          /*return Response.json({data:{
            data:messagesFiltered.map(({_id,subject,read,updatedAt,messages})=>({id:_id.toString(),timestamp:updatedAt,read,subject,messages,updatedAt})),logged:true}},{status:200})*/
          /**
             id: number | string;
               subject: string;
               //lastMessage: string;
               timestamp: Date;
               read: boolean;
               admin_read?: boolean;
               updatedAt:Date;
               messages: Message[];
               isDraft?:boolean;
               draft?:string;
             */

    }
}
return returned;
}

export const initSocket = (httpServer: any) => {
  io = new SocketIOServer(httpServer, {
    cors: { origin: "*", credentials: true },
    transports: ['websocket', 'polling']
  });

  io.adapter(createAdapter(pubClient, subClient));

  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId as string;
    const role = socket.handshake.query.role as 'use' | 'sys';
    
    // ====================== USER ======================
    if (role === 'use' || 'sys') {
      const roomId = `livechat:${userId}`;
      socket.join(roomId);
      console.log(`User ${userId} joined room ${roomId}`);
    }

    // ====================== ADMIN ======================
    if (role === 'sys') {
      // Admin wants to join a specific user's chat (even if user is offline)
      socket.join('livechat:system');
      socket.on('admin_join_user_chat', async (targetUserId: string) => {
        const roomId = `livechat:${targetUserId}`;

        socket.join(roomId);
        console.log(`Admin joined chat with user: ${targetUserId}`);

        // Load previous messages from MongoDB and send to admin
        /*const previousMessages = await Message.find({ roomId })
          .sort({ timestamp: 1 })
          .limit(100);

        socket.emit('previous_messages', previousMessages);*/
      });
    }

    // ====================== SEND MESSAGE ======================
    socket.on('send_message', async (data:any) => {
      const {data:served_data,published,channel} = await send_message(data);
      /*const messagePayload = {
        id: Date.now().toString(),
        roomId: data.roomId,
        senderId: userId,
        senderRole: role,
        content: data.content,
        timestamp: new Date().toISOString(),
        isRead: role === 'admin' // admin messages are auto-read by system
      };

      // 1. Save message to MongoDB (persistence)
      await Message.create(messagePayload);*/

      // 2. Broadcast to everyone currently in the room
      if(channel && published)
      io.to(channel).emit('receive_message', published);
      if(served_data && served_data.length > 0){
        served_data.forEach(element => {
          io.to(element.channel).emit('receive_message',element.published);
        });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Disconnected: ${role} ${userId}`);
    });
  });

  return io;
};
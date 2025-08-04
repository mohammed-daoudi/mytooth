import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const userData = verifyToken(token);

    if (!userData) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Get unique conversation partners with latest message
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: userData.userId },
            { recipient: userData.userId }
          ]
        }
      },
      {
        $addFields: {
          otherUser: {
            $cond: {
              if: { $eq: ['$sender', userData.userId] },
              then: '$recipient',
              else: '$sender'
            }
          }
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: '$otherUser',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$recipient', userData.userId] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);

    // Populate user details for each conversation partner
    const populatedConversations = await User.populate(conversations, {
      path: '_id',
      select: 'name email role avatar createdAt'
    });

    // Also populate message sender/recipient info
    const finalConversations = await Message.populate(populatedConversations, [
      {
        path: 'lastMessage.sender',
        select: 'name email role avatar'
      },
      {
        path: 'lastMessage.recipient',
        select: 'name email role avatar'
      }
    ]);

    // Format the response
    const formattedConversations = finalConversations.map(conv => ({
      user: conv._id,
      lastMessage: conv.lastMessage,
      unreadCount: conv.unreadCount
    }));

    return NextResponse.json({
      conversations: formattedConversations,
      total: formattedConversations.length
    });

  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

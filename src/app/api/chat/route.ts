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

    const { searchParams } = new URL(request.url);
    const conversationWith = searchParams.get('with');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = conversationWith
      ? {
          $or: [
            { sender: userData.userId, recipient: conversationWith },
            { sender: conversationWith, recipient: userData.userId }
          ]
        }
      : {
          $or: [
            { sender: userData.userId },
            { recipient: userData.userId }
          ]
        };

    const messages = await Message.find(query)
      .populate('sender', 'name email role avatar')
      .populate('recipient', 'name email role avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Message.countDocuments(query);

    // Mark messages as read if viewing conversation
    if (conversationWith) {
      await Message.updateMany(
        {
          sender: conversationWith,
          recipient: userData.userId,
          isRead: false
        },
        { isRead: true, readAt: new Date() }
      );
    }

    return NextResponse.json({
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { recipient, content, messageType = 'text', attachments = [] } = body;

    // Validate required fields
    if (!recipient || !content) {
      return NextResponse.json(
        { error: 'Recipient and content are required' },
        { status: 400 }
      );
    }

    // Validate recipient exists
    const recipientUser = await User.findById(recipient);
    if (!recipientUser) {
      return NextResponse.json(
        { error: 'Recipient not found' },
        { status: 404 }
      );
    }

    // Check if user can send messages to this recipient
    // Patients can only message admin/dentist, staff can message anyone
    if (userData.role === 'patient' && !['admin', 'dentist'].includes(recipientUser.role)) {
      return NextResponse.json(
        { error: 'You can only message clinic staff' },
        { status: 403 }
      );
    }

    // Create message
    const message = new Message({
      sender: userData.userId,
      recipient,
      content: content.trim(),
      messageType,
      attachments,
      isRead: false
    });

    await message.save();

    // Populate the message before returning
    await message.populate('sender', 'name email role avatar');
    await message.populate('recipient', 'name email role avatar');

    // Emit real-time message via Socket.io (if socket server is available)
    // This would be handled by the Socket.io server in a production environment

    return NextResponse.json({
      message: 'Message sent successfully',
      data: message
    }, { status: 201 });

  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

import express, { Request, Response } from 'express';
import moment from 'moment-timezone';
import User, {IUser} from './models/userModels';
import FailedMessage from './models/failedMessage';
import mongoose from 'mongoose';

const app = express();
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/messagescheduler')
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

app.post('/user', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
});

app.delete('/user', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOneAndDelete({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted' });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
});

async function checkBirthdaysAndSendMessages() {
  const today = moment().format('MM-DD');

  try {
    const users = await User.find();
    users.forEach(user => {
      const userBirthday = moment(user.birthday).tz(user.timezone).format('MM-DD');
 
      if (userBirthday === today) {
        sendBirthdayEmail(user).catch((emailError: unknown) => {
          if (emailError instanceof Error) {
            console.error(`Failed to send birthday email to ${user.email}: ${emailError.message}`);
          } else {
            console.error(`Failed to send birthday email to ${user.email}: An unknown error occurred`);
          }
        });
      }
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching users:', error.message);
    } else {
      console.error('An unknown error occurred while fetching users');
    }
  }
}

async function sendBirthdayEmail(user: IUser) {
  try {
    let messageBody = `Hey, ${user.firstName} ${user.lastName}, it's your birthday!`;
    const response = await fetch('https://email-service.digitalenvision.com.au/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        message: messageBody,
      })
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    console.log(messageBody);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Failed to send email: ${error.message}`);
      
      throw error;
    } else {
      console.error('An unknown error occurred while sending email');
      throw new Error('Unknown error in sendBirthdayEmail');
    }
  }
}

async function resendFailedMessages() {
  const failedMessages = await FailedMessage.find({ status: 'failed' });

  for (const message of failedMessages) {
    try {
  
      message.status = 'resent';
      await message.save();
    } catch (error) {
      message.retry_count += 1;
      message.error_message = error.message;
      await message.save();
    }
  }
}

setInterval(checkBirthdaysAndSendMessages, 6000);

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});

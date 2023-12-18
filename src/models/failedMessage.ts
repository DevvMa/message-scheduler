import mongoose, { Schema, Document } from 'mongoose';

interface IFailedMessage extends Document {
  message_id: mongoose.Types.ObjectId;
  recipient: string;
  scheduled_send_time: Date;
  failure_time: Date;
  error_message?: string;
  retry_count: number;
  status?: string;
}

const FailedMessageSchema: Schema = new Schema({
  message_id: { type: Schema.Types.ObjectId, required: true },
  recipient: { type: String, required: true },
  scheduled_send_time: { type: Date, required: true },
  failure_time: { type: Date, default: Date.now },
  error_message: { type: String },
  retry_count: { type: Number, default: 0 },
  status: { type: String }
});

const FailedMessage = mongoose.model<IFailedMessage>('FailedMessage', FailedMessageSchema);

export default FailedMessage;

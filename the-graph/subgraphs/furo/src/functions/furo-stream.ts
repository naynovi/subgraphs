import { BigInt, ethereum } from '@graphprotocol/graph-ts';
import { Stream } from '../../generated/schema';
import {
  LogCreateStream as CreateStreamEvent,
  LogCancelStream as CancelStreamEvent,
  LogWithdrawFromStream as WithdrawalEvent
} from '../../generated/FuroStream/FuroStream';
import { getOrCreateUser } from './user';
import { getOrCreateToken } from './token';
import { CANCELLED, ONGOING } from '../constants';
import { increaseStreamCount } from './furo';


export function getOrCreateStream(id: BigInt): Stream {
  let stream = Stream.load(id.toString())

  if (stream === null) {
    stream = new Stream(id.toString())
    increaseStreamCount()
  }
  stream.save()

  return stream as Stream
}

export function createStream(event: CreateStreamEvent): Stream {
  let stream = getOrCreateStream(event.params.streamId)
  let recipient = getOrCreateUser(event.params.recipient, event)
  let sender = getOrCreateUser(event.params.sender, event)
  let token = getOrCreateToken(event.params.token.toHex(), event)

  stream.recipient = recipient.id
  stream.amount = event.params.amount
  stream.withdrawnAmount = BigInt.fromU32(0)
  stream.token = token.id
  stream.status = ONGOING
  stream.createdBy = sender.id
  stream.fromBentoBox = event.params.fromBentoBox
  stream.startedAt = event.params.startTime
  stream.expiresAt = event.params.endTime

  stream.createdAtBlock = event.block.number
  stream.createdAtTimestamp = event.block.timestamp
  stream.modifiedAtBlock = event.block.number
  stream.modifiedAtTimestamp = event.block.timestamp
  stream.save()


  return stream
}

export function cancelStream(event: CancelStreamEvent): Stream {
  let stream = getOrCreateStream(event.params.streamId)
  stream.amount = BigInt.fromU32(0)
  stream.status = CANCELLED
  stream.modifiedAtBlock = event.block.number
  stream.modifiedAtTimestamp = event.block.timestamp
  stream.save()

  return stream
}

export function withdrawFromStream(event: WithdrawalEvent) : Stream {
  const stream = getOrCreateStream(event.params.streamId)
  stream.withdrawnAmount = stream.withdrawnAmount.plus(event.params.sharesToWithdraw)
  stream.modifiedAtBlock = event.block.number
  stream.modifiedAtTimestamp = event.block.timestamp
  stream.save()

  return stream
}
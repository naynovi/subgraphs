import {
  CancelStream as CancelStreamEvent,
  CreateStream as CreateStreamEvent,
  UpdateStream as UpdateStreamEvent,
  Withdraw as WithdrawEvent,
} from '../../generated/FuroStream/FuroStream'
import { cancelStream, createStream, getOrCreateStream, withdrawFromStream } from '../functions/stream'
import {
  createDepositTransaction,
  createDisbursementTransactions,
  createWithdrawalTransaction,
} from '../functions/transaction'

export function onCreateStream(event: CreateStreamEvent): void {
  const stream = createStream(event)
  createDepositTransaction(stream, event)
}

export function onCancelStream(event: CancelStreamEvent): void {
  const stream = cancelStream(event)
  createDisbursementTransactions(stream, event)
}

export function onUpdateStream(event: UpdateStreamEvent): void {

}

export function onWithdraw(event: WithdrawEvent): void {
  const stream = withdrawFromStream(event)
  createWithdrawalTransaction(stream, event)
}

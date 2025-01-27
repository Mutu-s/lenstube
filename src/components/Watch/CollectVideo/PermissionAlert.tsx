import { useLazyQuery } from '@apollo/client'
import { Button } from '@components/UIElements/Button'
import { getCollectModuleConfig } from '@utils/functions/getCollectModule'
import React, { Dispatch, FC } from 'react'
import toast from 'react-hot-toast'
import {
  ApprovedAllowanceAmount,
  GenerateModuleCurrencyApprovalDataDocument
} from 'src/types/lens'
import { CustomErrorWithData } from 'src/types/local'
import { useSendTransaction, useWaitForTransaction } from 'wagmi'

type Props = {
  setIsAllowed: Dispatch<boolean>
  isAllowed: boolean
  allowanceModule: ApprovedAllowanceAmount
}

const PermissionAlert: FC<Props> = ({
  setIsAllowed,
  isAllowed,
  allowanceModule
}) => {
  const [generateAllowanceQuery, { loading }] = useLazyQuery(
    GenerateModuleCurrencyApprovalDataDocument
  )

  const {
    data: txData,
    isLoading: transactionLoading,
    sendTransaction
  } = useSendTransaction({
    request: {},
    mode: 'recklesslyUnprepared',
    onError(error: CustomErrorWithData) {
      toast.error(error?.data?.message ?? error?.message)
    }
  })
  const { isLoading: waiting } = useWaitForTransaction({
    hash: txData?.hash,
    onSuccess() {
      toast.success(
        `Module ${isAllowed ? 'disabled' : 'enabled'} successfully!`
      )
      setIsAllowed(!isAllowed)
    },
    onError(error: CustomErrorWithData) {
      toast.error(error?.data?.message ?? error?.message)
    }
  })

  const handleAllowance = async () => {
    const result = await generateAllowanceQuery({
      variables: {
        request: {
          currency: allowanceModule.currency,
          value: Number.MAX_SAFE_INTEGER.toString(),
          [getCollectModuleConfig(allowanceModule.module).type]:
            allowanceModule.module
        }
      }
    })
    const data = result?.data?.generateModuleCurrencyApprovalData
    sendTransaction?.({
      recklesslySetUnpreparedRequest: {
        from: data?.from,
        to: data?.to,
        data: data?.data
      }
    })
  }

  return (
    <div className="flex justify-end">
      <Button
        loading={transactionLoading || waiting || loading}
        onClick={() => handleAllowance()}
        disabled={transactionLoading || waiting || loading}
      >
        Allow Collect
      </Button>
    </div>
  )
}

export default PermissionAlert

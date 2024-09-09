"use client";
import Head from "next/head";
import dynamic from "next/dynamic";
import {
  useBlockNumber,
  useAccount,
  useBalance,
  useContractRead,
  useContract,
  useContractWrite,
  useExplorer,
  useWaitForTransaction,
} from "@starknet-react/core";
import { BlockNumber } from "starknet";
import contractAbi from "../abis/erc20abi.json";
import { useState, useMemo } from "react";

const WalletBar = dynamic(() => import("../components/WalletBar"), {
  ssr: false,
});
const Page: React.FC = () => {
  // Step 1 --> Read the latest block -- Start
  const {
    data: blockNumberData,
    isLoading: blockNumberIsLoading,
    isError: blockNumberIsError,
  } = useBlockNumber({
    blockIdentifier: "latest" as BlockNumber,
  });
  const workshopEnds = 68224;
  // Step 1 --> Read the latest block -- End

  // Step 2 --> Read your balance -- Start
  const { address: userAddress } = useAccount();
  const {
    isLoading: balanceIsLoading,
    isError: balanceIsError,
    error: balanceError,
    data: balanceData,
  } = useBalance({
    address: userAddress,
    watch: true,
  });
  // Step 2 --> Read your balance -- End

  // Step 3 --> Read from a contract -- Start
  const contractAddress =
    "0x0050f0e6b58337daf4f0bf3274c915b40445a841b5fad9ea7cbbfec4ae180513";
  const {
    data: readData,
    refetch: dataRefetch,
    isError: readIsError,
    isLoading: readIsLoading,
    error: readError,
  } = useContractRead({
    functionName: "total_supply",
    args: [],
    abi: contractAbi,
    address: contractAddress,
    watch: true,
  });
  // Step 3 --> Read from a contract -- End

  // Step 4 --> Write to a contract -- Start
  const [amount, setAmount] = useState(0);
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Form submitted with amount ", amount);
    // TO DO: Implement Starknet logic here
    writeAsync();
  };
  const { contract } = useContract({
    abi: contractAbi,
    address: contractAddress,
  });
  const calls = useMemo(() => {
    if (!userAddress || !contract) return [];
    return contract.populateTransaction["mint"]!(userAddress, {
      low: amount ? amount : 0,
      high: 0,
    });
  }, [contract, userAddress, amount]);
  const {
    writeAsync,
    data: writeData,
    isPending: writeIsPending,
  } = useContractWrite({
    calls,
  });
  const explorer = useExplorer();
  const {
    isLoading: waitIsLoading,
    isError: waitIsError,
    error: waitError,
    data: waitData,
  } = useWaitForTransaction({ hash: writeData?.transaction_hash, watch: true });

  const [transferAmount, setTransferAmount] = useState(0);
  const [recipient, setRecipient] = useState<string | undefined>(undefined);
  const handleTransferSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    console.log("Form submitted with amount ", amount);
    // TO DO: Implement Starknet logic here
    writeTransferAsync();
  };
  const transferCalls = useMemo(() => {
    if (!recipient || !contract) return [];
    return contract.populateTransaction["transfer"]!(recipient, {
      low: transferAmount ? transferAmount : 0,
      high: 0,
    });
  }, [contract, recipient, transferAmount]);
  const {
    writeAsync: writeTransferAsync,
    data: writeTransferData,
    isPending: writeTransferIsPending,
  } = useContractWrite({
    calls: transferCalls,
  });
  const {
    isLoading: waitTransferIsLoading,
    isError: waitTransferIsError,
    error: waitTransferError,
    data: waitTransferData,
  } = useWaitForTransaction({ hash: writeData?.transaction_hash, watch: true });

  const LoadingState = ({ message }: { message: string }) => (
    <div className="flex items-center space-x-2">
      <div className="animate-spin">
        <svg
          className="h-5 w-5 text-gray-800"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      </div>
      <span>{message}</span>
    </div>
  );
  const buttonContent = () => {
    if (writeIsPending) {
      return <LoadingState message="Send..." />;
    }

    if (waitIsLoading) {
      return <LoadingState message="Waiting for confirmation..." />;
    }

    if (waitData && waitData.status === "REJECTED") {
      return <LoadingState message="Transaction rejected..." />;
    }

    if (waitData) {
      return "Transaction confirmed";
    }

    return "Mint";
  };
  const transferButtonContent = () => {
    if (writeTransferIsPending) {
      return <LoadingState message="Send..." />;
    }

    if (waitTransferIsLoading) {
      return <LoadingState message="Waiting for confirmation..." />;
    }

    if (waitTransferData && waitTransferData.status === "REJECTED") {
      return <LoadingState message="Transaction rejected..." />;
    }

    if (waitTransferData) {
      return "Transaction confirmed";
    }

    return "Transfer";
  };
  // Step 4 --> Write to a contract -- End

  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <Head>
        <title>Frontend Workshop</title>
      </Head>
      <div className="flex flex-row mb-4">
        <WalletBar />
      </div>

      {/* Step 1 --> Read the latest block -- Start */}
      {!blockNumberIsLoading && !blockNumberIsError && (
        <div
          className={`p-4 w-full max-w-md m-4 border-black border ${
            blockNumberData! < workshopEnds ? "bg-green-500" : "bg-red-500"
          }`}
        >
          <h3 className="text-2xl font-bold mb-2">Read the Blockchain</h3>
          <p>Current Block Number: {blockNumberData}</p>
          {blockNumberData! < workshopEnds
            ? "We're live on Workshop"
            : "Workshop has ended"}
        </div>
      )}
      {/* <div
        className={`p-4 w-full max-w-md m-4 border-black border bg-white`}
      >
        <h3 className="text-2xl font-bold mb-2">Read the Blockchain</h3>
        <p>Current Block Number: xyz</p>
        Are we live?
      </div> */}
      {/* Step 1 --> Read the latest block -- End */}

      {/* Step 2 --> Read your balance -- Start */}
      {!balanceIsLoading && !balanceIsError && (
        <div
          className={`p-4 w-full max-w-md m-4 bg-green-900 border-black border`}
        >
          <h3 className="text-2xl font-bold mb-2">Read your Balance</h3>
          <p>Symbol: {balanceData?.symbol}</p>
          <p>Balance: {Number(balanceData?.formatted).toFixed(4)}</p>
        </div>
      )}
      {/* <div
        className={`p-4 w-full max-w-md m-4 bg-white border-black border`}
      >
        <h3 className="text-2xl font-bold mb-2">Read your Balance</h3>
        <p>Symbol: Ticker</p>
        <p>Balance: xyz</p>
      </div> */}
      {/* Step 2 --> Read your balance -- End */}

      {/* Step 3 --> Read from a contract -- Start */}
      <div
        className={`p-4 w-full max-w-md m-4 bg-yellow-400 border-black border`}
      >
        <h3 className="text-2xl font-bold mb-2">Read your Contract</h3>
        <p>Total Supply: {readData?.toString()}</p>
        <div className="flex justify-center pt-4">
          <button
            onClick={() => dataRefetch()}
            className={`border border-black text-black font-regular py-2 px-4 bg-yellow-300 hover:bg-yellow-500`}
          >
            Refresh
          </button>
        </div>
      </div>
      {/* <div
        className={`p-4 w-full max-w-md m-4 bg-white border-black border`}
      >
        <h3 className="text-2xl font-bold mb-2">Read your Contract</h3>
        <p>Balance: xyz</p>
        <div className="flex justify-center pt-4">
          <button
            onClick={() => console.log("Refresh")}
            className={`border border-black text-black font-regular py-2 px-4 bg-yellow-300 hover:bg-yellow-500`}
          >
            Refresh
          </button>
        </div>
      </div> */}
      {/* Step 3 --> Read from a contract -- End */}

      {/* Step 4 --> Write to a contract -- Start */}
      <div className="flex flex-row flex-nowrap justify-center w-full">
        <form
          onSubmit={handleSubmit}
          className="bg-blue-900 p-4 w-full max-w-md m-4 border-black border"
        >
          <h3 className="text-2xl font-bold mb-2">
            Write to a Contract (Mint)
          </h3>
          <label
            htmlFor="amount"
            className="block text-sm font-medium leading-6 text-white"
          >
            Amount:
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(event) => setAmount(event.target.valueAsNumber)}
            className="bg-blue-400 block w-full px-3 py-2 text-sm leading-6 border-black focus:outline-none focus:border-yellow-300 black-border-p"
          />
          {writeData?.transaction_hash && (
            <a
              href={explorer.transaction(writeData?.transaction_hash)}
              target="_blank"
              className="text-blue-500 hover:text-blue-700 underline"
              rel="noreferrer"
            >
              Check TX on {explorer.name}
            </a>
          )}
          <div className="flex justify-center pt-4">
            <button
              type="submit"
              className={`border border-black text-black font-regular py-2 px-4 ${
                userAddress ? "bg-yellow-300 hover:bg-yellow-500" : "bg-white"
              } `}
              disabled={!userAddress}
            >
              {buttonContent()}
            </button>
          </div>
        </form>
        <form
          onSubmit={handleTransferSubmit}
          className="bg-blue-900 p-4 w-full max-w-md m-4 border-black border"
        >
          <h3 className="text-2xl font-bold mb-2">
            Write to a Contract (Transfer)
          </h3>
          <label
            htmlFor="recipient"
            className="block text-sm font-medium leading-6 text-white"
          >
            Recipient:
          </label>
          <input
            type="text"
            id="recipient"
            value={recipient}
            onChange={(event) => setRecipient(event.target.value)}
            className="bg-blue-400 block w-full px-3 py-2 text-sm leading-6 border-black focus:outline-none focus:border-yellow-300 black-border-p"
          />
          <label
            htmlFor="amount"
            className="block text-sm font-medium leading-6 text-white"
          >
            Amount:
          </label>
          <input
            type="number"
            id="amount"
            value={transferAmount}
            onChange={(event) => setTransferAmount(event.target.valueAsNumber)}
            className="bg-blue-400 block w-full px-3 py-2 text-sm leading-6 border-black focus:outline-none focus:border-yellow-300 black-border-p"
          />
          {writeTransferData?.transaction_hash && (
            <a
              href={explorer.transaction(writeTransferData?.transaction_hash)}
              target="_blank"
              className="text-blue-500 hover:text-blue-700 underline"
              rel="noreferrer"
            >
              Check TX on {explorer.name}
            </a>
          )}
          <div className="flex justify-center pt-4">
            <button
              type="submit"
              className={`border border-black text-black font-regular py-2 px-4 ${
                recipient ? "bg-yellow-300 hover:bg-yellow-500" : "bg-white"
              } `}
              disabled={!recipient}
            >
              {transferButtonContent()}
            </button>
          </div>
        </form>
      </div>
      {/* Step 4 --> Write to a contract -- End */}
    </div>
  );
};

export default Page;

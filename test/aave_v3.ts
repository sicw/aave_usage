import {
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import {ethers} from "hardhat";
import hre from "hardhat";
import PoolV3Artifact from "@aave/core-v3/artifacts/contracts/protocol/pool/Pool.sol/Pool.json";
// import { AaveV2Avalanche } from "@bgd-labs/aave-address-book";   // Unknown file extension ".ts"
import {POOL} from "./AaveV3ArbitrumConstants"
import {AaveV3ArbitrumAssets_DAI_UNDERLYING} from "./AaveV3ArbitrumAssetsConstants"
import {DataTypes} from "@aave/core-v3/dist/types/types/protocol/pool/Pool";

describe("AAVE", function () {

    async function deployAAVEProtocolFixture() {
        const mockAccount = '0xebb17ec2bce083605a9a665cbd905ece11e5498a';
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [mockAccount]
        });
        const signer = await ethers.provider.getSigner(mockAccount);
        const pool = new ethers.Contract(POOL, PoolV3Artifact.abi, signer);
        return {pool, signer};
    }

    describe.skip("Before Test", function () {
        it("block number", async function () {
            const blockNum = await ethers.provider.getBlockNumber();
            console.log(`blockNum:${blockNum}`)
        });

        it("account balance", async function () {
            const account = '0xebb17ec2bce083605a9a665cbd905ece11e5498a';
            const balance = await ethers.provider.getBalance(account);
            console.log(`balance:${ethers.formatEther(balance)}`);
        });

        it("Impersonate Account", async function () {
            const mockAccount = '0xebb17ec2bce083605a9a665cbd905ece11e5498a';
            await hre.network.provider.request({
                method: "hardhat_impersonateAccount",
                params: [mockAccount]
            });
            const signer = await ethers.provider.getSigner(mockAccount);
            const address = await signer.getAddress();
            console.log(`impersonate account address:${address}`);
            const nonce = await signer.getNonce();
            console.log(`impersonate account nonce:${nonce}`)
        });
    });

    describe("supply logic", function () {
        it.skip("getReserveData", async function () {
            const {pool} = await loadFixture(deployAAVEProtocolFixture);
            const reserveData: DataTypes.ReserveDataStruct = await pool.getReserveData(AaveV3ArbitrumAssets_DAI_UNDERLYING);
            console.log(`DAI aTokenAddress:${reserveData.aTokenAddress}`);
        });
    });
});

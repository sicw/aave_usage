import {
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import {ethers} from "hardhat";
import hre from "hardhat";
import PoolV3Artifact from "@aave/core-v3/artifacts/contracts/protocol/pool/Pool.sol/Pool.json";
import L2PoolV3Artifact from "@aave/core-v3/artifacts/contracts/protocol/pool/L2Pool.sol/L2Pool.json";
import L2EncoderV3Artifact from "@aave/core-v3/artifacts/contracts/misc/L2Encoder.sol/L2Encoder.json";
// import { AaveV2Avalanche } from "@bgd-labs/aave-address-book";   // Unknown file extension ".ts"
import {POOL, L2_ENCODER} from "./AaveV3ArbitrumConstants"
import {
    AaveV3ArbitrumAssets_DAI_UNDERLYING,
    AaveV3ArbitrumAssets_MAI_UNDERLYING,
    AaveV3ArbitrumAssets_WETH_UNDERLYING
} from "./AaveV3ArbitrumAssetsConstants"
import {DataTypes} from "@aave/core-v3/dist/types/types/protocol/pool/Pool";
import {formatUnits, parseEther, parseUnits} from "ethers";
import {HardhatEthersSigner} from "@nomicfoundation/hardhat-ethers/src/signers";
import {getImpersonateAccount} from "./helper";
import {IMPERSONATE_ACCOUNT} from "./constants";

describe("AAVE", function () {

    async function deployAAVEProtocolFixture() {
        const signer = await getImpersonateAccount(IMPERSONATE_ACCOUNT);
        const pool = new ethers.Contract(POOL, PoolV3Artifact.abi, signer);
        const l2pool = new ethers.Contract(POOL, L2PoolV3Artifact.abi, signer);
        const L2Encoder = new ethers.Contract(L2_ENCODER, L2EncoderV3Artifact.abi, signer);
        const result = {
            pool,
            l2pool,
            L2Encoder,
            signer,
            mockAccount:IMPERSONATE_ACCOUNT
        };
        return result;
    }

    describe.skip("Before Test", function () {
        it("block number", async function () {
            const blockNum = await ethers.provider.getBlockNumber();
            console.log(`blockNum:${blockNum}`)
        });

        it("account balance", async function () {
            const {mockAccount} = await loadFixture(deployAAVEProtocolFixture);
            const balance = await ethers.provider.getBalance(mockAccount);
            console.log(`balance:${ethers.formatEther(balance)}`);
        });

        it("Impersonate Account", async function () {
            const {mockAccount} = await loadFixture(deployAAVEProtocolFixture);
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

        it.skip("L2Encoder", async function () {
            const {pool, L2Encoder} = await loadFixture(deployAAVEProtocolFixture);
            const supplyEth = parseEther('0.01');
            const params = await L2Encoder.encodeSupplyParams(AaveV3ArbitrumAssets_WETH_UNDERLYING, supplyEth, 0);
            console.log(`params:${params}`);
        });

        it.skip("supply", async function () {
            const {l2pool, L2Encoder} = await loadFixture(deployAAVEProtocolFixture);
            const supplyEth = parseEther('0.01');
            const params = await L2Encoder.encodeSupplyParams(AaveV3ArbitrumAssets_MAI_UNDERLYING, supplyEth, 0);
            const resp = await l2pool.supply(params);
            console.log(`supply:${JSON.stringify(resp)}`);
        });
    });
});

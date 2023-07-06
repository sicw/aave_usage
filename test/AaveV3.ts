import {loadFixture,} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import {ethers} from "hardhat";
import PoolV3Artifact from "@aave/core-v3/artifacts/contracts/protocol/pool/Pool.sol/Pool.json";
import L2PoolV3Artifact from "@aave/core-v3/artifacts/contracts/protocol/pool/L2Pool.sol/L2Pool.json";
import L2EncoderV3Artifact from "@aave/core-v3/artifacts/contracts/misc/L2Encoder.sol/L2Encoder.json";
// import { AaveV2Avalanche } from "@bgd-labs/aave-address-book";   // Unknown file extension ".ts"
import {L2_ENCODER, POOL} from "./AaveV3ArbitrumConstants"
import {
    AaveV3ArbitrumAssets_DAI_A_TOKEN,
    AaveV3ArbitrumAssets_DAI_UNDERLYING,
    AaveV3ArbitrumAssets_WETH_UNDERLYING
} from "./AaveV3ArbitrumAssetsConstants"
import {DataTypes} from "@aave/core-v3/dist/types/types/protocol/pool/Pool";
import {parseEther} from "ethers";
import {EthUtil,} from "./utils/EthUtil";
import {IMPERSONATE_ACCOUNT, RICH_DAI_ACCOUNT, RICH_ETH_ACCOUNT} from "./Constants";
import {AccountUtil} from "./utils/AccountUtil";
import {Erc20Util} from "./utils/Erc20Util";

describe("AAVE", function () {

    async function deployAAVEProtocolFixture() {
        const signer = await AccountUtil.getImpersonateAccount(IMPERSONATE_ACCOUNT);
        const pool = new ethers.Contract(POOL, PoolV3Artifact.abi, signer);
        const l2pool = new ethers.Contract(POOL, L2PoolV3Artifact.abi, signer);
        const L2Encoder = new ethers.Contract(L2_ENCODER, L2EncoderV3Artifact.abi, signer);
        return {
            pool,
            l2pool,
            L2Encoder
        };
    }

    describe.skip("Before Test", function () {
        it("block number", async function () {
            const blockNum = await ethers.provider.getBlockNumber();
            console.log(`blockNum:${blockNum}`)
        });

        it("account balance", async function () {
            const balance = await EthUtil.getBalance(IMPERSONATE_ACCOUNT);
            console.log(`balance:${balance}`);
        });

        it("Impersonate Account", async function () {
            const signer = await AccountUtil.getImpersonateAccount(IMPERSONATE_ACCOUNT);
            const address = await signer.getAddress();
            console.log(`impersonate account address:${address}`);
            const nonce = await signer.getNonce();
            console.log(`impersonate account nonce:${nonce}`)
        });

        it("send eth", async function () {
            await EthUtil.transfer(RICH_ETH_ACCOUNT, IMPERSONATE_ACCOUNT, 10);
            const balance = await EthUtil.getBalance(IMPERSONATE_ACCOUNT);
            console.log(`eth balance:${balance}`);
        });

        it("send dai", async function () {
            await EthUtil.transfer(RICH_ETH_ACCOUNT, RICH_DAI_ACCOUNT, 10);
            await Erc20Util.transfer(AaveV3ArbitrumAssets_DAI_UNDERLYING, RICH_DAI_ACCOUNT, IMPERSONATE_ACCOUNT, 100);
            const balance = await Erc20Util.balanceOf(AaveV3ArbitrumAssets_DAI_UNDERLYING, IMPERSONATE_ACCOUNT);
            console.log(`dai balance:${balance}`);
        });
    });

    describe.skip("coin send and encoder", function () {
        it("getReserveData", async function () {
            const {pool} = await loadFixture(deployAAVEProtocolFixture);
            const reserveData: DataTypes.ReserveDataStruct = await pool.getReserveData(AaveV3ArbitrumAssets_DAI_UNDERLYING);
            console.log(`DAI aTokenAddress:${reserveData.aTokenAddress}`);
        });

        it("L2Encoder", async function () {
            const {L2Encoder} = await loadFixture(deployAAVEProtocolFixture);
            const supplyEth = parseEther('0.01');
            const params = await L2Encoder.encodeSupplyParams(AaveV3ArbitrumAssets_WETH_UNDERLYING, supplyEth, 0);
            console.log(`params:${params}`);
        });

        it("inc coin", async function () {
            // 给仿冒账户充值
            await EthUtil.transfer(RICH_ETH_ACCOUNT, IMPERSONATE_ACCOUNT, 10);
            await EthUtil.transfer(RICH_ETH_ACCOUNT, RICH_DAI_ACCOUNT, 10);
            await Erc20Util.transfer(AaveV3ArbitrumAssets_DAI_UNDERLYING, RICH_DAI_ACCOUNT, IMPERSONATE_ACCOUNT, 100);
            await Erc20Util.approve(AaveV3ArbitrumAssets_DAI_UNDERLYING, IMPERSONATE_ACCOUNT, AaveV3ArbitrumAssets_DAI_A_TOKEN, 100);

            let ethBalance = await EthUtil.getBalance(IMPERSONATE_ACCOUNT);
            console.log(`${IMPERSONATE_ACCOUNT} eth balance:${ethBalance}`);

            ethBalance = await EthUtil.getBalance(RICH_DAI_ACCOUNT);
            console.log(`${RICH_DAI_ACCOUNT} eth balance:${ethBalance}`);

            let daiBalance = await Erc20Util.balanceOf(AaveV3ArbitrumAssets_DAI_UNDERLYING, IMPERSONATE_ACCOUNT);
            console.log(`${IMPERSONATE_ACCOUNT} dai balance:${daiBalance}`);

            const allowance = await Erc20Util.allowance(AaveV3ArbitrumAssets_DAI_UNDERLYING, IMPERSONATE_ACCOUNT, AaveV3ArbitrumAssets_DAI_A_TOKEN);
            console.log(`allowance:${allowance}`);
        });
    });

    describe("supply logic", function () {
        it("supply", async function () {
            const {l2pool, L2Encoder} = await loadFixture(deployAAVEProtocolFixture);

            // 给仿冒账户充值
            await EthUtil.transfer(RICH_ETH_ACCOUNT, IMPERSONATE_ACCOUNT, 10);
            await EthUtil.transfer(RICH_ETH_ACCOUNT, RICH_DAI_ACCOUNT, 10);
            await Erc20Util.transfer(AaveV3ArbitrumAssets_DAI_UNDERLYING, RICH_DAI_ACCOUNT, IMPERSONATE_ACCOUNT, 100);
            // 注意这里是要给pool合约approve
            await Erc20Util.approve(AaveV3ArbitrumAssets_DAI_UNDERLYING, IMPERSONATE_ACCOUNT, POOL, 100);

            const supplyDAI = parseEther('10');
            // 两种调用方式
            // const params = await L2Encoder.encodeSupplyParams(AaveV3ArbitrumAssets_DAI_UNDERLYING, supplyDAI, 0);
            // const supplyResp = await l2pool.supply(params);
            // await supplyResp.wait();
            const supplyResp = await l2pool.supply(AaveV3ArbitrumAssets_DAI_UNDERLYING, supplyDAI, IMPERSONATE_ACCOUNT, 0);
            await supplyResp.wait();

            // todo
            console.log(`dai aToken amount:${JSON.stringify(supplyResp.blockHash)}`);
        });
    });
});

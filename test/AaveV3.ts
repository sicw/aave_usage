import {loadFixture,} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import {ethers} from "hardhat";
import {time} from "@nomicfoundation/hardhat-network-helpers";
import PoolV3Artifact from "@aave/core-v3/artifacts/contracts/protocol/pool/Pool.sol/Pool.json";
import L2PoolV3Artifact from "@aave/core-v3/artifacts/contracts/protocol/pool/L2Pool.sol/L2Pool.json";
import L2EncoderV3Artifact from "@aave/core-v3/artifacts/contracts/misc/L2Encoder.sol/L2Encoder.json";
// import { AaveV2Avalanche } from "@bgd-labs/aave-address-book";   // Unknown file extension ".ts"
import {L2_ENCODER, POOL} from "./constants/AaveV3ArbitrumConstants"
import {
    AaveV3ArbitrumAssets_DAI_A_TOKEN,
    AaveV3ArbitrumAssets_DAI_UNDERLYING, AaveV3ArbitrumAssets_USDC_UNDERLYING,
    AaveV3ArbitrumAssets_WETH_UNDERLYING
} from "./constants/AaveV3ArbitrumAssetsConstants"
import {DataTypes} from "@aave/core-v3/dist/types/types/protocol/pool/Pool";
import {parseEther} from "ethers";
import {EthUtil,} from "./utils/EthUtil";
import {IMPERSONATE_ACCOUNT, RICH_DAI_ACCOUNT, RICH_ETH_ACCOUNT, TEST_ACCOUNT} from "./constants/Constants";
import {AccountUtil} from "./utils/AccountUtil";
import {Erc20Util} from "./utils/Erc20Util";
import {AaveContractUtils} from "./utils/AaveContractUtils";

describe("AAVE", function () {

    async function deployAAVEProtocolFixture() {
        // 获取仿冒账户
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

    describe("Before Test", function () {
        it("block number", async function () {
            const blockNum = await ethers.provider.getBlockNumber();
            console.log(`current blockNum:${blockNum}`)
        });

        it("account balance", async function () {
            const balance = await EthUtil.getBalance(IMPERSONATE_ACCOUNT);
            console.log(`impersonate account eth balance:${balance}`);
        });

        it("Impersonate Account", async function () {
            const signer = await AccountUtil.getImpersonateAccount(IMPERSONATE_ACCOUNT);
            // const address = await signer.getAddress();
            // console.log(`impersonate account address:${address}`);
            const nonce = await signer.getNonce();
            console.log(`impersonate account nonce:${nonce}`)
        });

        it("send eth", async function () {
            await EthUtil.transfer(RICH_ETH_ACCOUNT, IMPERSONATE_ACCOUNT, 1000);
            const balance = await EthUtil.getBalance(IMPERSONATE_ACCOUNT);
            console.log(`impersonate account balance:${balance} after transfer 1000 eth`);
        });

        it("send dai", async function () {
            await EthUtil.transfer(RICH_ETH_ACCOUNT, RICH_DAI_ACCOUNT, 10);
            await Erc20Util.transfer(AaveV3ArbitrumAssets_DAI_UNDERLYING, RICH_DAI_ACCOUNT, IMPERSONATE_ACCOUNT, 1000);
            const balance = await Erc20Util.balanceOf(AaveV3ArbitrumAssets_DAI_UNDERLYING, IMPERSONATE_ACCOUNT);
            console.log(`dai balance:${balance} after transfer 1000 dai`);
        });

        it("dai aToken balance", async function () {
            let aDaiBalance = await Erc20Util.balanceOf(AaveV3ArbitrumAssets_DAI_A_TOKEN, IMPERSONATE_ACCOUNT);
            console.log(`dai aToken amount:${aDaiBalance}`);
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

    describe.skip("supply logic", function () {
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

            let aDaiBalance = await Erc20Util.balanceOf(AaveV3ArbitrumAssets_DAI_A_TOKEN, IMPERSONATE_ACCOUNT);
            console.log(`dai aToken amount:${aDaiBalance}`);
        });
    });

    describe.skip("supply logic balanceOf", function () {
        // 存款
        it.skip("balanceOf", async function () {
            const {l2pool, L2Encoder} = await loadFixture(deployAAVEProtocolFixture);

            // 给仿冒账户充值
            await EthUtil.transfer(RICH_ETH_ACCOUNT, IMPERSONATE_ACCOUNT, 10);
            await EthUtil.transfer(RICH_ETH_ACCOUNT, RICH_DAI_ACCOUNT, 10);
            await Erc20Util.transfer(AaveV3ArbitrumAssets_DAI_UNDERLYING, RICH_DAI_ACCOUNT, IMPERSONATE_ACCOUNT, 100);
            // 注意这里是要给pool合约approve
            await Erc20Util.approve(AaveV3ArbitrumAssets_DAI_UNDERLYING, IMPERSONATE_ACCOUNT, POOL, 100);

            // 在107375632块上(Jul-03-2023 07:00:50 AM) 已经有了37个aDAI币

            // 更改时间戳
            await time.setNextBlockTimestamp(2752825045);

            // 为了mint新块创建的交易. setNextBlockTimestamp只有在下一次mint时会更改block time
            let supplyDAI = parseEther('1');
            let supplyResp = await l2pool.supply(AaveV3ArbitrumAssets_DAI_UNDERLYING, supplyDAI, IMPERSONATE_ACCOUNT, 0);
            await supplyResp.wait();

            // 正常37+1=38个aDAI, 加上时间利息=63.7aDAI
            let aDaiBalance = await Erc20Util.balanceOf(AaveV3ArbitrumAssets_DAI_A_TOKEN, IMPERSONATE_ACCOUNT);
            console.log(`dai aToken amount:${aDaiBalance}`);
        });

        // 取款
        it.skip("withdraw", async function () {
            const {l2pool, L2Encoder} = await loadFixture(deployAAVEProtocolFixture);

            // 给仿冒账户充值
            await EthUtil.transfer(RICH_ETH_ACCOUNT, IMPERSONATE_ACCOUNT, 10);
            await EthUtil.transfer(RICH_ETH_ACCOUNT, RICH_DAI_ACCOUNT, 10);
            await Erc20Util.transfer(AaveV3ArbitrumAssets_DAI_UNDERLYING, RICH_DAI_ACCOUNT, IMPERSONATE_ACCOUNT, 100);
            // 注意这里是要给pool合约approve
            await Erc20Util.approve(AaveV3ArbitrumAssets_DAI_UNDERLYING, IMPERSONATE_ACCOUNT, POOL, 100);

            // 在107375632块上(Jul-03-2023 07:00:50 AM) 已经有了37个aDAI币

            // 更改时间戳
            await time.setNextBlockTimestamp(2752825045);

            // 为了mint新块创建的交易. setNextBlockTimestamp只有在下一次mint时会更改block time
            let supplyDAI = parseEther('1');
            let supplyResp = await l2pool.supply(AaveV3ArbitrumAssets_DAI_UNDERLYING, supplyDAI, IMPERSONATE_ACCOUNT, 0);
            await supplyResp.wait();

            // 正常37+1=38个aDAI, 加上时间利息=63.7aDAI
            let aDaiBalance = await Erc20Util.balanceOf(AaveV3ArbitrumAssets_DAI_A_TOKEN, IMPERSONATE_ACCOUNT);
            console.log(`before withdraw dai aToken amount:${aDaiBalance}`);

            let withdrawDAICount = parseEther('60');
            // 发送交易完成
            const withdrawResp = await l2pool.withdraw(AaveV3ArbitrumAssets_DAI_UNDERLYING, withdrawDAICount, TEST_ACCOUNT);
            // 等待区块确认
            await withdrawResp.wait();

            aDaiBalance = await Erc20Util.balanceOf(AaveV3ArbitrumAssets_DAI_A_TOKEN, IMPERSONATE_ACCOUNT);
            console.log(`after withdraw dai aToken amount:${aDaiBalance}`);

            let testAccountDaiBalance = await Erc20Util.balanceOf(AaveV3ArbitrumAssets_DAI_UNDERLYING, TEST_ACCOUNT);
            console.log(`test account dai token amount:${testAccountDaiBalance}`);

        });

        // 借贷
        it.skip("borrow", async function () {
            const {l2pool} = await loadFixture(deployAAVEProtocolFixture);

            // 给仿冒账户充值
            await EthUtil.transfer(RICH_ETH_ACCOUNT, IMPERSONATE_ACCOUNT, 1000);

            let usdcAcount = parseEther('5000');
            const borrowResp = await l2pool.borrow(AaveV3ArbitrumAssets_USDC_UNDERLYING, usdcAcount, 1, 0, IMPERSONATE_ACCOUNT);
            await borrowResp.wait();

            // 用什么抵押, 抵押币够不够? todo
            let USDCBalance = await Erc20Util.balanceOf(AaveV3ArbitrumAssets_USDC_UNDERLYING, IMPERSONATE_ACCOUNT);
            console.log(`borrow usdc amount:${USDCBalance}`);
        });

        // 借贷test
        it("borrowTest", async function () {
            const {l2pool} = await loadFixture(deployAAVEProtocolFixture);
            const reserveData : DataTypes.ReserveDataStruct = await l2pool.getReserveData(AaveV3ArbitrumAssets_USDC_UNDERLYING);
            /**
             configuration:379853422389047447188855351506279752947723411136420
             liquidityIndex:1016168028378681120381950694
             currentLiquidityRate:23026227920059288220160701
             variableBorrowIndex:1029089360027063665701271710
             currentVariableBorrowRate:31309178741922514865817786
             currentStableBorrowRate:49472739820274644980831112
             lastUpdateTimestamp:1688367632
             id:2
             aTokenAddress:0x625E7708f30cA75bfd92586e17077590C60eb4cD
             stableDebtTokenAddress:0x307ffe186F84a3bc2613D1eA417A5737D69A7007
             variableDebtTokenAddress:0xFCCf3cAbbe80101232d343252614b6A3eE81C989
             interestRateStrategyAddress:0xd9d85499449f26d2A2c240defd75314f23920089
             accruedToTreasury:2135081367
             unbacked:0
             isolationModeTotalDebt:0
             */
            console.log(`configuration:${reserveData.configuration}`);
            console.log(`liquidityIndex:${reserveData.liquidityIndex}`);
            console.log(`currentLiquidityRate:${reserveData.currentLiquidityRate}`);
            console.log(`variableBorrowIndex:${reserveData.variableBorrowIndex}`);
            console.log(`currentVariableBorrowRate:${reserveData.currentVariableBorrowRate}`);
            console.log(`currentStableBorrowRate:${reserveData.currentStableBorrowRate}`);
            console.log(`lastUpdateTimestamp:${reserveData.lastUpdateTimestamp}`);
            console.log(`id:${reserveData.id}`);
            console.log(`aTokenAddress:${reserveData.aTokenAddress}`);
            console.log(`stableDebtTokenAddress:${reserveData.stableDebtTokenAddress}`);
            console.log(`variableDebtTokenAddress:${reserveData.variableDebtTokenAddress}`);
            console.log(`interestRateStrategyAddress:${reserveData.interestRateStrategyAddress}`);
            console.log(`accruedToTreasury:${reserveData.accruedToTreasury}`);
            console.log(`unbacked:${reserveData.unbacked}`);
            console.log(`isolationModeTotalDebt:${reserveData.isolationModeTotalDebt}`);
        });

        it.skip("ProtocolDataProvider.getReserveCaps", async function () {
            const protocolDataProvider = await AaveContractUtils.getProtocolDataProvider();
            const caps = await protocolDataProvider.getReserveCaps(AaveV3ArbitrumAssets_USDC_UNDERLYING);
            // [ 100000000n, 150000000n ]
            console.log(caps);
        });

        it.skip("ProtocolDataProvider.getReserveConfigurationData", async function () {
            const protocolDataProvider = await AaveContractUtils.getProtocolDataProvider();
            const [decimals, ltv, liquidationThreshold, liquidationBonus, reserveFactor,
                usageAsCollateralEnabled, borrowingEnabled,
                stableBorrowRateEnabled, isActive, isFrozen] = await protocolDataProvider.getReserveConfigurationData(AaveV3ArbitrumAssets_USDC_UNDERLYING);
            /**
             decimals:6
             ltv:8100
             liquidationThreshold:8600
             liquidationBonus:10500
             reserveFactor:1000
             usageAsCollateralEnabled:true
             borrowingEnabled:true
             stableBorrowRateEnabled:true
             isActive:true
             isFrozen:false
             */
            console.log(`decimals:${decimals}`);
            console.log(`ltv:${ltv}`);
            console.log(`liquidationThreshold:${liquidationThreshold}`);
            console.log(`liquidationBonus:${liquidationBonus}`);
            console.log(`reserveFactor:${reserveFactor}`);
            console.log(`usageAsCollateralEnabled:${usageAsCollateralEnabled}`);
            console.log(`borrowingEnabled:${borrowingEnabled}`);
            console.log(`stableBorrowRateEnabled:${stableBorrowRateEnabled}`);
            console.log(`isActive:${isActive}`);
            console.log(`isFrozen:${isFrozen}`);
        });
    });
});

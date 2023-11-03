import {loadFixture,} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import {ethers} from "hardhat";
import {time} from "@nomicfoundation/hardhat-network-helpers";
import PoolV3Artifact from "@aave/core-v3/artifacts/contracts/protocol/pool/Pool.sol/Pool.json";
import L2PoolV3Artifact from "@aave/core-v3/artifacts/contracts/protocol/pool/L2Pool.sol/L2Pool.json";
import L2EncoderV3Artifact from "@aave/core-v3/artifacts/contracts/misc/L2Encoder.sol/L2Encoder.json";
import ATokenArtifact from "@aave/core-v3/artifacts/contracts/protocol/tokenization/AToken.sol/AToken.json";
// import { AaveV2Avalanche } from "@bgd-labs/aave-address-book";   // Unknown file extension ".ts"
import {L2_ENCODER, POOL} from "./constants/AaveV3ArbitrumConstants"
import {
    AaveV3ArbitrumAssets_DAI_A_TOKEN,
    AaveV3ArbitrumAssets_DAI_UNDERLYING,
    AaveV3ArbitrumAssets_USDC_UNDERLYING,
    AaveV3ArbitrumAssets_USDT_A_TOKEN,
    AaveV3ArbitrumAssets_USDT_UNDERLYING, AaveV3ArbitrumAssets_WETH_A_TOKEN,
    AaveV3ArbitrumAssets_WETH_UNDERLYING
} from "./constants/AaveV3ArbitrumAssetsConstants"
import {DataTypes} from "@aave/core-v3/dist/types/types/protocol/pool/Pool";
import {formatUnits, parseEther, parseUnits} from "ethers";
import {EthUtil,} from "./utils/EthUtil";
import {
    IMPERSONATE_ACCOUNT1,
    RICH_DAI_ACCOUNT,
    RICH_ETH_ACCOUNT,
    IMPERSONATE_ACCOUNT3,
    IMPERSONATE_ACCOUNT2, RICH_USDT_ACCOUNT1, RAY, RAY_100, RAY_10000, RICH_USDT_ACCOUNT2
} from "./constants/Constants";
import {AccountUtil} from "./utils/AccountUtil";
import {Erc20Util} from "./utils/Erc20Util";
import {AaveContractUtils} from "./utils/AaveContractUtils";
import {DataTypes} from "@aave/core-v3/dist/types/types/interfaces/IPool";
import ReserveDataStruct = DataTypes.ReserveDataStruct;
import ERC20Artifact
    from "@aave/core-v3/artifacts/contracts/dependencies/openzeppelin/contracts/IERC20.sol/IERC20.json";
import {WethUtils} from "./utils/WethUtils";

describe("AAVE", function () {

    async function deployAAVEProtocolFixture() {
        // 获取仿冒账户
        const signer = await AccountUtil.getImpersonateAccount(IMPERSONATE_ACCOUNT1);
        const pool = new ethers.Contract(POOL, PoolV3Artifact.abi, signer);
        const l2pool = new ethers.Contract(POOL, L2PoolV3Artifact.abi, signer);
        const L2Encoder = new ethers.Contract(L2_ENCODER, L2EncoderV3Artifact.abi, signer);
        return {
            signer,
            pool,
            l2pool,
            L2Encoder
        };
    }

    describe.skip("Before Test", function () {
        it("block number", async function () {
            const blockNum = await ethers.provider.getBlockNumber();
            console.log(`current blockNum:${blockNum}`)
        });

        it("account balance", async function () {
            const balance = await EthUtil.getBalance(IMPERSONATE_ACCOUNT1);
            console.log(`impersonate account eth balance:${balance}`);
        });

        it("Impersonate Account", async function () {
            const signer = await AccountUtil.getImpersonateAccount(IMPERSONATE_ACCOUNT1);
            // const address = await signer.getAddress();
            // console.log(`impersonate account address:${address}`);
            const nonce = await signer.getNonce();
            console.log(`impersonate account nonce:${nonce}`)
        });

        it("send eth", async function () {
            await EthUtil.transfer(RICH_ETH_ACCOUNT, IMPERSONATE_ACCOUNT1, 1000);
            const balance = await EthUtil.getBalance(IMPERSONATE_ACCOUNT1);
            console.log(`impersonate account balance:${balance} after transfer 1000 eth`);
        });

        it("send dai", async function () {
            await EthUtil.transfer(RICH_ETH_ACCOUNT, RICH_DAI_ACCOUNT, 10);
            await Erc20Util.transfer(AaveV3ArbitrumAssets_DAI_UNDERLYING, RICH_DAI_ACCOUNT, IMPERSONATE_ACCOUNT1, 1000);
            const balance = await Erc20Util.balanceOf(AaveV3ArbitrumAssets_DAI_UNDERLYING, IMPERSONATE_ACCOUNT1);
            console.log(`dai balance:${balance} after transfer 1000 dai`);
        });

        it("dai aToken balance", async function () {
            let aDaiBalance = await Erc20Util.balanceOf(AaveV3ArbitrumAssets_DAI_A_TOKEN, IMPERSONATE_ACCOUNT1);
            console.log(`dai aToken amount:${aDaiBalance}`);
        });
    });

    describe.skip("Query balance increase", function () {

        it.skip("遍历区块, 查询当时supply的事件", async function () {
            const eventABI = ['event Supply(address indexed reserve,address user,address indexed onBehalfOf,uint256 amount,uint16 indexed referralCode)'];
            const iface = new ethers.Interface(eventABI);
            const filterEncodeData = iface.encodeFilterTopics('Supply', ['0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',null, '0xebb17ec2bce083605a9a665cbd905ece11e5498a', null, 0]);
            const logs = await ethers.provider.getLogs({
                fromBlock: 105700511,
                toBlock: 105708511,
                topics: filterEncodeData
            });
            // [{"_type":"log","address":"0x794a61358D6845594F94dc1DB02A252b5b4814aD","blockHash":"0xdff9f20a5ea22c79c75334cfd78dc14081c2709d9b4a29310730b9a46a7430e8","blockNumber":105702414,"data":"0x000000000000000000000000ebb17ec2bce083605a9a665cbd905ece11e5498a000000000000000000000000000000000000000000000000000000000510ff40","index":18,"removed":false,"topics":["0x2b627736bca15cd5381dcf80b0bf11fd197d01a037c52b927a881a10fb73ba61","0x000000000000000000000000fd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9","0x000000000000000000000000ebb17ec2bce083605a9a665cbd905ece11e5498a","0x0000000000000000000000000000000000000000000000000000000000000000"],"transactionHash":"0xb1d236c6fa92ce756a8b76740fba21caad18f06527879f4a94018932ee7306f6","transactionIndex":3},{"_type":"log","address":"0x794a61358D6845594F94dc1DB02A252b5b4814aD","blockHash":"0x405c75069347a54f5ea46e7ccceec53be5e0035d43ee3b4cc71c0e2a74de1568","blockNumber":105704510,"data":"0x000000000000000000000000ebb17ec2bce083605a9a665cbd905ece11e5498a00000000000000000000000000000000000000000000000000000000001e8480","index":6,"removed":false,"topics":["0x2b627736bca15cd5381dcf80b0bf11fd197d01a037c52b927a881a10fb73ba61","0x000000000000000000000000fd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9","0x000000000000000000000000ebb17ec2bce083605a9a665cbd905ece11e5498a","0x0000000000000000000000000000000000000000000000000000000000000000"],"transactionHash":"0xa27e9f12e888a9ae221a7087a86c5f1131dbf24781d7f6db8f23973aadc7823a","transactionIndex":1}]
            // data中的数据是user+amount
            // 0x1e8480 + 0x510ff40
            console.log(JSON.stringify(logs))
        });

        it.skip("从arbiscan查看账户信息, 存储时有emit Event", async function () {
            // https://arbiscan.io/address/0xebb17ec2bce083605a9a665cbd905ece11e5498a
            // 最开始共操作两次Supply With Permit 85000000 + 2000000
            // aToken decimal: 6
            // 时间20230728 共87$
            // 时间20231030 共88.17$
            // 累计124天
            // 收益率 3.92% (1.17 / 124 * 365 / 87 * 100%)
        });

        it("获取balanceOf乘以当时的index", async function () {
            const {signer} = await loadFixture(deployAAVEProtocolFixture);
            const aTokenUsdt = new ethers.Contract(AaveV3ArbitrumAssets_USDT_A_TOKEN, ATokenArtifact.abi, signer);
            const scaledBalanceOf = await aTokenUsdt.scaledBalanceOf(IMPERSONATE_ACCOUNT1);
            const previousIndex = await aTokenUsdt.getPreviousIndex(IMPERSONATE_ACCOUNT1);
            // 87000056091756065051665751799932552n
            // 保留decimal 6位 870000
            console.log(scaledBalanceOf * previousIndex);
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
            await EthUtil.transfer(RICH_ETH_ACCOUNT, IMPERSONATE_ACCOUNT1, 10);
            await EthUtil.transfer(RICH_ETH_ACCOUNT, RICH_DAI_ACCOUNT, 10);
            await Erc20Util.transfer(AaveV3ArbitrumAssets_DAI_UNDERLYING, RICH_DAI_ACCOUNT, IMPERSONATE_ACCOUNT1, 100);
            await Erc20Util.approve(AaveV3ArbitrumAssets_DAI_UNDERLYING, IMPERSONATE_ACCOUNT1, AaveV3ArbitrumAssets_DAI_A_TOKEN, 100);

            let ethBalance = await EthUtil.getBalance(IMPERSONATE_ACCOUNT1);
            console.log(`${IMPERSONATE_ACCOUNT1} eth balance:${ethBalance}`);

            ethBalance = await EthUtil.getBalance(RICH_DAI_ACCOUNT);
            console.log(`${RICH_DAI_ACCOUNT} eth balance:${ethBalance}`);

            let daiBalance = await Erc20Util.balanceOf(AaveV3ArbitrumAssets_DAI_UNDERLYING, IMPERSONATE_ACCOUNT1);
            console.log(`${IMPERSONATE_ACCOUNT1} dai balance:${daiBalance}`);

            const allowance = await Erc20Util.allowance(AaveV3ArbitrumAssets_DAI_UNDERLYING, IMPERSONATE_ACCOUNT1, AaveV3ArbitrumAssets_DAI_A_TOKEN);
            console.log(`allowance:${allowance}`);
        });
    });

    describe.skip("supply logic", function () {
        it("supply", async function () {
            const {l2pool, L2Encoder} = await loadFixture(deployAAVEProtocolFixture);

            // 给仿冒账户充值
            await EthUtil.transfer(RICH_ETH_ACCOUNT, IMPERSONATE_ACCOUNT1, 10);
            await EthUtil.transfer(RICH_ETH_ACCOUNT, RICH_DAI_ACCOUNT, 10);
            await Erc20Util.transfer(AaveV3ArbitrumAssets_DAI_UNDERLYING, RICH_DAI_ACCOUNT, IMPERSONATE_ACCOUNT, 100);
            // 注意这里是要给pool合约approve
            await Erc20Util.approve(AaveV3ArbitrumAssets_DAI_UNDERLYING, IMPERSONATE_ACCOUNT1, POOL, 100);

            const supplyDAI = parseEther('10');
            // 两种调用方式
            // const params = await L2Encoder.encodeSupplyParams(AaveV3ArbitrumAssets_DAI_UNDERLYING, supplyDAI, 0);
            // const supplyResp = await l2pool.supply(params);
            // await supplyResp.wait();
            const supplyResp = await l2pool.supply(AaveV3ArbitrumAssets_DAI_UNDERLYING, supplyDAI, IMPERSONATE_ACCOUNT1, 0);
            await supplyResp.wait();

            let aDaiBalance = await Erc20Util.balanceOf(AaveV3ArbitrumAssets_DAI_A_TOKEN, IMPERSONATE_ACCOUNT1);
            console.log(`dai aToken amount:${aDaiBalance}`);
        });
    });

    describe.skip("supply logic balanceOf", function () {
        // 存款
        it.skip("balanceOf", async function () {
            const {l2pool, L2Encoder} = await loadFixture(deployAAVEProtocolFixture);

            // 给仿冒账户充值
            await EthUtil.transfer(RICH_ETH_ACCOUNT, IMPERSONATE_ACCOUNT1, 10);
            await EthUtil.transfer(RICH_ETH_ACCOUNT, RICH_DAI_ACCOUNT, 10);
            await Erc20Util.transfer(AaveV3ArbitrumAssets_DAI_UNDERLYING, RICH_DAI_ACCOUNT, IMPERSONATE_ACCOUNT1, 100);
            // 注意这里是要给pool合约approve
            await Erc20Util.approve(AaveV3ArbitrumAssets_DAI_UNDERLYING, IMPERSONATE_ACCOUNT1, POOL, 100);

            // 在107375632块上(Jul-03-2023 07:00:50 AM) 已经有了37个aDAI币

            // 更改时间戳
            await time.setNextBlockTimestamp(2752825045);

            // 为了mint新块创建的交易. setNextBlockTimestamp只有在下一次mint时会更改block time
            let supplyDAI = parseEther('1');
            let supplyResp = await l2pool.supply(AaveV3ArbitrumAssets_DAI_UNDERLYING, supplyDAI, IMPERSONATE_ACCOUNT1, 0);
            await supplyResp.wait();

            // 正常37+1=38个aDAI, 加上时间利息=63.7aDAI
            let aDaiBalance = await Erc20Util.balanceOf(AaveV3ArbitrumAssets_DAI_A_TOKEN, IMPERSONATE_ACCOUNT1);
            console.log(`dai aToken amount:${aDaiBalance}`);
        });

        // 取款
        it.skip("withdraw", async function () {
            const {l2pool, L2Encoder} = await loadFixture(deployAAVEProtocolFixture);

            // 给仿冒账户充值
            await EthUtil.transfer(RICH_ETH_ACCOUNT, IMPERSONATE_ACCOUNT1, 10);
            await EthUtil.transfer(RICH_ETH_ACCOUNT, RICH_DAI_ACCOUNT, 10);
            await Erc20Util.transfer(AaveV3ArbitrumAssets_DAI_UNDERLYING, RICH_DAI_ACCOUNT, IMPERSONATE_ACCOUNT1, 100);
            // 注意这里是要给pool合约approve
            await Erc20Util.approve(AaveV3ArbitrumAssets_DAI_UNDERLYING, IMPERSONATE_ACCOUNT1, POOL, 100);

            // 在107375632块上(Jul-03-2023 07:00:50 AM) 已经有了37个aDAI币

            // 更改时间戳
            await time.setNextBlockTimestamp(2752825045);

            // 为了mint新块创建的交易. setNextBlockTimestamp只有在下一次mint时会更改block time
            let supplyDAI = parseEther('1');
            let supplyResp = await l2pool.supply(AaveV3ArbitrumAssets_DAI_UNDERLYING, supplyDAI, IMPERSONATE_ACCOUNT1, 0);
            await supplyResp.wait();

            // 正常37+1=38个aDAI, 加上时间利息=63.7aDAI
            let aDaiBalance = await Erc20Util.balanceOf(AaveV3ArbitrumAssets_DAI_A_TOKEN, IMPERSONATE_ACCOUNT1);
            console.log(`before withdraw dai aToken amount:${aDaiBalance}`);

            let withdrawDAICount = parseEther('60');
            // 发送交易完成
            const withdrawResp = await l2pool.withdraw(AaveV3ArbitrumAssets_DAI_UNDERLYING, withdrawDAICount, IMPERSONATE_ACCOUNT3);
            // 等待区块确认
            await withdrawResp.wait();

            aDaiBalance = await Erc20Util.balanceOf(AaveV3ArbitrumAssets_DAI_A_TOKEN, IMPERSONATE_ACCOUNT1);
            console.log(`after withdraw dai aToken amount:${aDaiBalance}`);

            let testAccountDaiBalance = await Erc20Util.balanceOf(AaveV3ArbitrumAssets_DAI_UNDERLYING, IMPERSONATE_ACCOUNT3);
            console.log(`test account dai token amount:${testAccountDaiBalance}`);

        });

        // 借贷
        it.skip("borrow", async function () {
            const {l2pool} = await loadFixture(deployAAVEProtocolFixture);

            // 给仿冒账户充值
            await EthUtil.transfer(RICH_ETH_ACCOUNT, IMPERSONATE_ACCOUNT1, 1000);

            let usdcAcount = parseEther('5000');
            const borrowResp = await l2pool.borrow(AaveV3ArbitrumAssets_USDC_UNDERLYING, usdcAcount, 1, 0, IMPERSONATE_ACCOUNT1);
            await borrowResp.wait();

            // 用什么抵押, 抵押币够不够? todo
            let USDCBalance = await Erc20Util.balanceOf(AaveV3ArbitrumAssets_USDC_UNDERLYING, IMPERSONATE_ACCOUNT1);
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

    describe("hack aave v3", function () {

        it.skip("查看当前利率", async function () {
            const {pool} = await loadFixture(deployAAVEProtocolFixture);
            const reserveDataStruct:ReserveDataStruct = await pool.getReserveData(AaveV3ArbitrumAssets_USDT_UNDERLYING);
            // 0754
            console.log(`usdt reserve currentLiquidityRate: ${reserveDataStruct.currentLiquidityRate / RAY_10000}`);
            // 1383
            console.log(`usdt reserve currentStableBorrowRate: ${reserveDataStruct.currentStableBorrowRate / RAY_10000}`);
        });

        it.skip("查看eth账户余额", async function () {
            const richEthAccountBalance = await EthUtil.getBalance(RICH_ETH_ACCOUNT);
            // 472871555262598796435379
            console.log(`RICH_ETH_ACCOUNT eth balance:${richEthAccountBalance}`);
        });

        it.skip("查询Erc20余额", async function () {
            const erc20Contract = new ethers.Contract(AaveV3ArbitrumAssets_USDT_UNDERLYING, ERC20Artifact.abi, ethers.provider);
            // 25726309208539
            const bl = await erc20Contract.balanceOf(RICH_USDT_ACCOUNT2);
            const fl = formatUnits(bl.toString(), 6);
            // 25726309.208539
            console.log(`IMPERSONATE_ACCOUNT2 usdt balance:${fl}`);
        });

        it.skip("查看当前USDT资金池存储量", async function () {
            const usdtReserveTotalSupply = await Erc20Util.totalSupply(AaveV3ArbitrumAssets_USDT_A_TOKEN);
            // 17050872301504
            // 17050872.301504
            console.log(`usdt资金池总存储量:${usdtReserveTotalSupply}`);
        });

        it.skip("weth存款、取款", async function () {
            let wethBalance = await WethUtils.totalSupply(AaveV3ArbitrumAssets_WETH_UNDERLYING, RICH_ETH_ACCOUNT);
            console.log(`weth total supply balance:${wethBalance}`)

            await WethUtils.deposit(AaveV3ArbitrumAssets_WETH_UNDERLYING, RICH_ETH_ACCOUNT, 10000);
            wethBalance = await WethUtils.totalSupply(AaveV3ArbitrumAssets_WETH_UNDERLYING, RICH_ETH_ACCOUNT);
            console.log(`weth balance after deposit:${wethBalance}`)

            await WethUtils.withdraw(AaveV3ArbitrumAssets_WETH_UNDERLYING, RICH_ETH_ACCOUNT, 100);
            wethBalance = await WethUtils.totalSupply(AaveV3ArbitrumAssets_WETH_UNDERLYING, RICH_ETH_ACCOUNT);
            console.log(`weth balance after withdraw:${wethBalance}`)

            wethBalance = await WethUtils.balanceOf(AaveV3ArbitrumAssets_WETH_UNDERLYING, RICH_ETH_ACCOUNT);
            console.log(`weth balance:${wethBalance}`)
        });

        it("贷款利率变化", async function () {
            /*
            * 假设有无限多的资金.
            * 1. 存入大量usdt, 降低利率
            * 2. 另一个账户稳定利率贷款
            * 3. 取出usdt
            *
            * 这样不现实, 1是有贷款利率rebalance. 2是有其他人会打破这种平衡
            * */
            const {l2pool} = await loadFixture(deployAAVEProtocolFixture);

            // 一、存储usdt 去充值
            const supplyUsdtAmount = 10000000_000000n;
            const supplyEthAmount = 10_000000000000000000n;
            await Erc20Util.transfer(AaveV3ArbitrumAssets_USDT_UNDERLYING, RICH_USDT_ACCOUNT1, IMPERSONATE_ACCOUNT2, supplyUsdtAmount);
            await EthUtil.transfer(RICH_ETH_ACCOUNT, IMPERSONATE_ACCOUNT2, supplyEthAmount);
            const impersonateAccount2Balance = await Erc20Util.balanceOf(AaveV3ArbitrumAssets_USDT_UNDERLYING, IMPERSONATE_ACCOUNT2);
            console.log(`IMPERSONATE_ACCOUNT2 usdt balance:${impersonateAccount2Balance}`);

            // 存储资金
            const signer2 = await AccountUtil.getImpersonateAccount(IMPERSONATE_ACCOUNT2);
            await Erc20Util.approve(AaveV3ArbitrumAssets_USDT_UNDERLYING, IMPERSONATE_ACCOUNT2, POOL, supplyUsdtAmount);
            const supplyResp = await l2pool.connect(signer2).supply(AaveV3ArbitrumAssets_USDT_UNDERLYING, supplyUsdtAmount, IMPERSONATE_ACCOUNT2, 0);
            await supplyResp.wait();

            let aUsdtBalance = await Erc20Util.balanceOf(AaveV3ArbitrumAssets_USDT_A_TOKEN, IMPERSONATE_ACCOUNT2);
            console.log(`usdt aToken amount:${aUsdtBalance}`);

            // 存储1千万usdt, 是稳定利率从13% 降到 5%
            let reserveDataStruct:ReserveDataStruct = await l2pool.getReserveData(AaveV3ArbitrumAssets_USDT_UNDERLYING);
            // 157
            console.log(`usdt reserve currentLiquidityRate: ${reserveDataStruct.currentLiquidityRate / RAY_10000}`);
            // 589
            console.log(`usdt reserve currentStableBorrowRate: ${reserveDataStruct.currentStableBorrowRate / RAY_10000}`);

            // 二、使用账户2进行稳定利率贷款

            // 1. 进行抵押设置
            // 存储eth 做做抵押贷款
            const ethCollateralAmount = 40010_000000000000000000n;
            const wethCollateralAmount = 20000_000000000000000000n;
            await EthUtil.transfer(RICH_ETH_ACCOUNT, IMPERSONATE_ACCOUNT3, ethCollateralAmount);
            const account3EthBalance = await EthUtil.getBalance(IMPERSONATE_ACCOUNT3);
            console.log(`account3EthBalance eth balance:${account3EthBalance}`);

            await WethUtils.deposit(AaveV3ArbitrumAssets_WETH_UNDERLYING, IMPERSONATE_ACCOUNT3, wethCollateralAmount);
            const impersonateAccount3WethBalance = await WethUtils.balanceOf(AaveV3ArbitrumAssets_WETH_UNDERLYING, IMPERSONATE_ACCOUNT3);
            console.log(`IMPERSONATE_ACCOUNT3 weth balance:${impersonateAccount3WethBalance}`);

            const signer3 = await AccountUtil.getImpersonateAccount(IMPERSONATE_ACCOUNT3);

            // 存储到weth资金池
            await Erc20Util.approve(AaveV3ArbitrumAssets_WETH_UNDERLYING, IMPERSONATE_ACCOUNT3, POOL, wethCollateralAmount);
            await l2pool.connect(signer3).supply(AaveV3ArbitrumAssets_WETH_UNDERLYING, wethCollateralAmount, IMPERSONATE_ACCOUNT3, 0);
            let aWethBalance = await Erc20Util.balanceOf(AaveV3ArbitrumAssets_WETH_A_TOKEN, IMPERSONATE_ACCOUNT3);
            console.log(`weth aToken amount:${aWethBalance}`);

            // 借款
            const borrowUsdtAmount = 3200000_000000n;
            await l2pool.connect(signer3).borrow(AaveV3ArbitrumAssets_USDT_UNDERLYING, borrowUsdtAmount, 1, 0, IMPERSONATE_ACCOUNT3);
            let account3USDTBalance = await Erc20Util.balanceOf(AaveV3ArbitrumAssets_USDT_UNDERLYING, IMPERSONATE_ACCOUNT3);
            console.log(`account3 usdt token amount:${account3USDTBalance}`);

            // 贷款320w后
            reserveDataStruct = await l2pool.getReserveData(AaveV3ArbitrumAssets_USDT_UNDERLYING);
            // 240
            console.log(`usdt reserve currentLiquidityRate: ${reserveDataStruct.currentLiquidityRate / RAY_10000}`);
            // 734
            console.log(`usdt reserve currentStableBorrowRate: ${reserveDataStruct.currentStableBorrowRate / RAY_10000}`);

            // 三、取回存款
            // todo 为啥不能取回1000w
            await l2pool.connect(signer2).withdraw(AaveV3ArbitrumAssets_USDT_UNDERLYING, 9850000_000000, IMPERSONATE_ACCOUNT2);
            // 取出1000w后
            reserveDataStruct = await l2pool.getReserveData(AaveV3ArbitrumAssets_USDT_UNDERLYING);
            // 4495
            console.log(`usdt reserve currentLiquidityRate: ${reserveDataStruct.currentLiquidityRate / RAY_10000}`);
            // 8228
            console.log(`usdt reserve currentStableBorrowRate: ${reserveDataStruct.currentStableBorrowRate / RAY_10000}`);
        });
    });
});

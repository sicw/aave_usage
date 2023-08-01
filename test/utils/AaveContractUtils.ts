import hre from 'hardhat'
import AaveProtocolDataProviderABI
    from "@aave/core-v3/artifacts/contracts/misc/AaveProtocolDataProvider.sol/AaveProtocolDataProvider.json";
import {AccountUtil} from "./AccountUtil";
import {AAVE_PROTOCOL_DATA_PROVIDER} from "../constants/AaveV3ArbitrumConstants";
import {IMPERSONATE_ACCOUNT} from "../constants/Constants";

export class AaveContractUtils {
    static async getProtocolDataProvider() {
        const signer = await AccountUtil.getImpersonateAccount(IMPERSONATE_ACCOUNT);
        return new hre.ethers.Contract(AAVE_PROTOCOL_DATA_PROVIDER, AaveProtocolDataProviderABI.abi, signer);
    }
}

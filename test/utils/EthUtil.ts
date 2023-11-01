import {ethers} from "hardhat";
import {parseEther} from "ethers";
import {AccountUtil} from "./AccountUtil";
import {BigNumberish} from "ethers/src.ts/utils/index";

export class EthUtil {
    static async transfer(from: string, to: string, amount: BigNumberish) {
        const richSigner = await AccountUtil.getImpersonateAccount(from);
        const txResp = await richSigner.sendTransaction({to: to, value: amount});
        await txResp.wait();
    }

    static async getBalance(account: string): Promise<BigInt> {
        const balance = await ethers.provider.getBalance(account);
        return Promise.resolve(balance);
    }
}

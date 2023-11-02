import {ethers} from "hardhat";
import {AccountUtil} from "./AccountUtil";
import {BigNumberish} from "ethers/src.ts/utils/index";
import WETHArtifact
    from "@aave/core-v3/artifacts/contracts/dependencies/weth/WETH9.sol/WETH9.json";

export class WethUtils {
    static async deposit(coin : string, account: string, amount: BigNumberish) {
        const signer = await AccountUtil.getImpersonateAccount(account);
        const wethContract = new ethers.Contract(coin, WETHArtifact.abi, signer);
        const txResp = await wethContract.deposit({value: amount});
        await txResp.wait();
    }

    static async withdraw(coin: string, account: string, amount: BigNumberish) {
        const signer = await AccountUtil.getImpersonateAccount(account);
        const wethContract = new ethers.Contract(coin, WETHArtifact.abi, signer);
        const txResp = await wethContract.withdraw(amount);
        await txResp.wait();
    }

    static async balanceOf(coin: string, account: string): Promise<BigInt> {
        const signer = await AccountUtil.getImpersonateAccount(account);
        const wethContract = new ethers.Contract(coin, WETHArtifact.abi, signer);
        const totalSupply = await wethContract.balanceOf(account);
        return Promise.resolve(totalSupply);
    }

    static async totalSupply(coin: string, account: string): Promise<BigInt> {
        const signer = await AccountUtil.getImpersonateAccount(account);
        const wethContract = new ethers.Contract(coin, WETHArtifact.abi, signer);
        const totalSupply = await wethContract.totalSupply();
        return Promise.resolve(totalSupply);
    }
}

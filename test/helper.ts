import {HardhatEthersSigner} from "@nomicfoundation/hardhat-ethers/src/signers";
import hre, {ethers} from "hardhat";

export async function getImpersonateAccount(account: string): Promise<HardhatEthersSigner> {
    await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [account]
    });
    return ethers.provider.getSigner(account);
}

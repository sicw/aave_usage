import {HardhatEthersSigner} from "@nomicfoundation/hardhat-ethers/src/signers";
import hre, {ethers} from "hardhat";
import {IMPERSONATE_ACCOUNT, RICH_DAI_ACCOUNT, RICH_ETH_ACCOUNT} from "./constants";
import {parseEther} from "ethers";

export async function getImpersonateAccount(account: string): Promise<HardhatEthersSigner> {
    return ethers.provider.getSigner(account);
}

export async function sendETHToAccount() {
    const richSigner = await getImpersonateAccount(RICH_ETH_ACCOUNT);
    await richSigner.sendTransaction({to: IMPERSONATE_ACCOUNT, value: parseEther('10')});
}

export async function sendWETHToAccount() {

}

export async function impersonateAccounts() {
    await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [IMPERSONATE_ACCOUNT, RICH_ETH_ACCOUNT, RICH_DAI_ACCOUNT]
    });
}

impersonateAccounts();

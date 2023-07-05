import {HardhatEthersSigner} from "@nomicfoundation/hardhat-ethers/src/signers";
import hre, {ethers} from "hardhat";
import {IMPERSONATE_ACCOUNT, RICH_DAI_ACCOUNT, RICH_ETH_ACCOUNT} from "./constants";
import {parseEther} from "ethers";
import {AaveV3ArbitrumAssets_DAI_A_TOKEN, AaveV3ArbitrumAssets_DAI_UNDERLYING} from "./AaveV3ArbitrumAssetsConstants";
import WETHArtifact from "@aave/core-v3/artifacts/contracts/dependencies/weth/WETH9.sol/WETH9.json";
import {POOL} from "./AaveV3ArbitrumConstants";

export async function send100DAI(address: string) {
    const signer = await getImpersonateAccount(RICH_DAI_ACCOUNT);
    const dai = new ethers.Contract(AaveV3ArbitrumAssets_DAI_UNDERLYING, WETHArtifact.abi, signer);
    const txResp = await dai.transfer(address, parseEther('100'));
    await txResp.wait();
}

export async function approveL2Pool50DAI() {
    const signer = await getImpersonateAccount(IMPERSONATE_ACCOUNT);
    const dai = new ethers.Contract(AaveV3ArbitrumAssets_DAI_UNDERLYING, WETHArtifact.abi, signer);
    // 注意这里approve的是POOL池子, 不是aToken
    const txResp = await dai.approve(POOL, parseEther('50'));
    // 等待区块确认(默认等待1个)
    await txResp.wait();
}

export async function getDaiBalance(address: string): Promise<string> {
    const signer = await getImpersonateAccount(RICH_DAI_ACCOUNT);
    const dai = new ethers.Contract(AaveV3ArbitrumAssets_DAI_UNDERLYING, WETHArtifact.abi, signer);
    return Promise.resolve(ethers.formatEther(await dai.balanceOf(address)));
}

export async function getAllowance(owner: string, spender: string): Promise<string> {
    const signer = await getImpersonateAccount(RICH_DAI_ACCOUNT);
    const dai = new ethers.Contract(AaveV3ArbitrumAssets_DAI_UNDERLYING, WETHArtifact.abi, signer);
    return Promise.resolve(ethers.formatEther(await dai.allowance(owner, spender)));
}


export async function getImpersonateAccount(account: string): Promise<HardhatEthersSigner> {
    await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [account]
    });
    return ethers.provider.getSigner(account);
}

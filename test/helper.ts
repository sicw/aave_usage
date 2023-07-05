import {HardhatEthersSigner} from "@nomicfoundation/hardhat-ethers/src/signers";
import hre, {ethers} from "hardhat";
import {IMPERSONATE_ACCOUNT, RICH_DAI_ACCOUNT, RICH_ETH_ACCOUNT} from "./constants";
import {parseEther} from "ethers";
import {AaveV3ArbitrumAssets_DAI_UNDERLYING} from "./AaveV3ArbitrumAssetsConstants";
import WETHArtifact from "@aave/core-v3/artifacts/contracts/dependencies/weth/WETH9.sol/WETH9.json";


export async function send10ETH(address: string) {
    const richSigner = await getImpersonateAccount(RICH_ETH_ACCOUNT);
    const txResp = await richSigner.sendTransaction({to: address, value: parseEther('10')});
    await txResp.wait();
}

export async function send100DAI(address: string) {
    const signer = await getImpersonateAccount(RICH_DAI_ACCOUNT);
    const dai = new ethers.Contract(AaveV3ArbitrumAssets_DAI_UNDERLYING, WETHArtifact.abi, signer);
    const txResp = await dai.transfer(address, parseEther('100'));
    await txResp.wait();
}

export async function getDaiBalance(address: string): Promise<string> {
    const signer = await getImpersonateAccount(RICH_DAI_ACCOUNT);
    const dai = new ethers.Contract(AaveV3ArbitrumAssets_DAI_UNDERLYING, WETHArtifact.abi, signer);
    return Promise.resolve(ethers.formatEther(await dai.balanceOf(address)));
}

export async function getEtherBalance(address: string): Promise<string> {
    const balance = await ethers.provider.getBalance(address);
    return Promise.resolve(ethers.formatEther(balance));
}

export async function getImpersonateAccount(account: string): Promise<HardhatEthersSigner> {
    await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [account]
    });
    return ethers.provider.getSigner(account);
}

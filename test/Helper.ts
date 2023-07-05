import {HardhatEthersSigner} from "@nomicfoundation/hardhat-ethers/src/signers";
import hre, {ethers} from "hardhat";
import {IMPERSONATE_ACCOUNT, RICH_DAI_ACCOUNT, RICH_ETH_ACCOUNT} from "./constants";
import {parseEther} from "ethers";
import {AaveV3ArbitrumAssets_DAI_A_TOKEN, AaveV3ArbitrumAssets_DAI_UNDERLYING} from "./AaveV3ArbitrumAssetsConstants";
import WETHArtifact from "@aave/core-v3/artifacts/contracts/dependencies/weth/WETH9.sol/WETH9.json";

export async function send10ETH(address: string) {
    const richSigner = await getImpersonateAccount(RICH_ETH_ACCOUNT);
    const txResp = await richSigner.sendTransaction({to: address, value: parseEther('10')});
    await txResp.wait();
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

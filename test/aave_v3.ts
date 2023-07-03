import {
    time,
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import {anyValue} from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import {expect} from "chai";
import {ethers} from "hardhat";
import hre from "hardhat";
import {defaultSolcOutputSelection} from "hardhat/internal/core/config/default-config";

describe("AAVE", function () {

    async function deployAAVEProtocolFixture() {
        const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
        const ONE_GWEI = 1_000_000_000;

        const lockedAmount = ONE_GWEI;
        const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS;

        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await ethers.getSigners();

        const Lock = await ethers.getContractFactory("Lock");
        const lock = await Lock.deploy(unlockTime, {value: lockedAmount});

        return {lock, unlockTime, lockedAmount, owner, otherAccount};
    }

    describe("Before Test", function () {
        it("block number", async function () {
            const blockNum = await ethers.provider.getBlockNumber();
            console.log(`blockNum:${blockNum}`)
        });

        it("account balance", async function () {
            const account = '0xebb17ec2bce083605a9a665cbd905ece11e5498a';
            const balance = await ethers.provider.getBalance(account);
            console.log(`balance:${ethers.formatEther(balance)}`);
        });

        it("Impersonate Account", async function () {
            const mockAccount = '0xebb17ec2bce083605a9a665cbd905ece11e5498a';
            await hre.network.provider.request({
                method: "hardhat_impersonateAccount",
                params: [mockAccount]
            });
            const signer = await ethers.provider.getSigner(mockAccount);
            const address = await signer.getAddress();
            console.log(`impersonate account address:${address}`);
            const nonce = await signer.getNonce();
            console.log(`impersonate account nonce:${nonce}`)
        });
    });

    describe("supply logic", function () {
        it("supply", async function () {
            const {aave} = await loadFixture(deployAAVEProtocolFixture);
        });
    });
});

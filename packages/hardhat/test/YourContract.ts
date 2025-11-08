import hre from 'hardhat';
import { expect } from 'chai';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { YourContract } from '../typechain-types';

describe('YourContract', () => {
  let yourContract: YourContract;
  let owner: HardhatEthersSigner;
  let addr1: HardhatEthersSigner;
  let addr2: HardhatEthersSigner;

  const toWei = (value: string) => hre.ethers.parseEther(value);

  beforeEach(async () => {
    [owner, addr1, addr2] = await hre.ethers.getSigners();

    const YourContractFactory = await hre.ethers.getContractFactory('YourContract');
    yourContract = await YourContractFactory.deploy(owner.address);
    await yourContract.waitForDeployment();
  });

  describe('Deployment', () => {
    it('should set the correct owner', async () => {
      expect(await yourContract.owner()).to.equal(owner.address);
    });

    it('should initialize with default greeting', async () => {
      expect(await yourContract.greeting()).to.equal('Building Unstoppable Apps!!!');
    });

    it('should initialize premium as false', async () => {
      expect(await yourContract.premium()).to.equal(false);
    });

    it('should initialize totalCounter as 0', async () => {
      expect(await yourContract.totalCounter()).to.equal(0);
    });

    it('should initialize user greeting counters as 0', async () => {
      expect(await yourContract.userGreetingCounter(owner.address)).to.equal(0);
      expect(await yourContract.userGreetingCounter(addr1.address)).to.equal(0);
    });
  });

  describe('setGreeting', () => {
    describe('Basic functionality', () => {
      it('should update greeting successfully', async () => {
        const newGreeting = 'Hello, Polkadot!';
        await yourContract.setGreeting(newGreeting);
        expect(await yourContract.greeting()).to.equal(newGreeting);
      });

      it('should increment totalCounter', async () => {
        await yourContract.setGreeting('First greeting');
        expect(await yourContract.totalCounter()).to.equal(1);

        await yourContract.setGreeting('Second greeting');
        expect(await yourContract.totalCounter()).to.equal(2);
      });

      it('should increment user greeting counter for caller', async () => {
        await yourContract.connect(addr1).setGreeting('Greeting 1');
        expect(await yourContract.userGreetingCounter(addr1.address)).to.equal(1);

        await yourContract.connect(addr1).setGreeting('Greeting 2');
        expect(await yourContract.userGreetingCounter(addr1.address)).to.equal(2);
      });

      it('should track separate counters for different users', async () => {
        await yourContract.connect(addr1).setGreeting('User 1 greeting');
        await yourContract.connect(addr2).setGreeting('User 2 greeting');
        await yourContract.connect(addr1).setGreeting('User 1 second greeting');

        expect(await yourContract.userGreetingCounter(addr1.address)).to.equal(2);
        expect(await yourContract.userGreetingCounter(addr2.address)).to.equal(1);
        expect(await yourContract.totalCounter()).to.equal(3);
      });
    });

    describe('Premium functionality (with payment)', () => {
      it('should set premium to true when ETH is sent', async () => {
        await yourContract.setGreeting('Premium greeting', { value: toWei('0.1') });
        expect(await yourContract.premium()).to.equal(true);
      });

      it('should set premium to false when no ETH is sent', async () => {
        // First set to premium
        await yourContract.setGreeting('Premium greeting', { value: toWei('0.1') });
        expect(await yourContract.premium()).to.equal(true);

        // Then set without payment
        await yourContract.setGreeting('Free greeting');
        expect(await yourContract.premium()).to.equal(false);
      });

      it('should accept various ETH amounts', async () => {
        await yourContract.setGreeting('Greeting 1', { value: toWei('0.001') });
        expect(await yourContract.premium()).to.equal(true);

        await yourContract.setGreeting('Greeting 2', { value: toWei('1.0') });
        expect(await yourContract.premium()).to.equal(true);

        await yourContract.setGreeting('Greeting 3', { value: toWei('10.5') });
        expect(await yourContract.premium()).to.equal(true);
      });

      it('should accumulate ETH in contract balance', async () => {
        const amount1 = toWei('0.5');
        const amount2 = toWei('0.3');

        await yourContract.connect(addr1).setGreeting('Greeting 1', { value: amount1 });
        await yourContract.connect(addr2).setGreeting('Greeting 2', { value: amount2 });

        const contractBalance = await hre.ethers.provider.getBalance(await yourContract.getAddress());
        expect(contractBalance).to.equal(amount1 + amount2);
      });
    });

    describe('Event emission', () => {
      it('should emit GreetingChange event with correct parameters (free)', async () => {
        const newGreeting = 'Test greeting';
        await expect(yourContract.connect(addr1).setGreeting(newGreeting))
          .to.emit(yourContract, 'GreetingChange')
          .withArgs(addr1.address, newGreeting, false, 0);
      });

      it('should emit GreetingChange event with correct parameters (premium)', async () => {
        const newGreeting = 'Premium greeting';
        const value = toWei('0.5');
        await expect(yourContract.connect(addr1).setGreeting(newGreeting, { value }))
          .to.emit(yourContract, 'GreetingChange')
          .withArgs(addr1.address, newGreeting, true, value);
      });
    });

    describe('Edge cases', () => {
      it('should handle empty string greeting', async () => {
        await yourContract.setGreeting('');
        expect(await yourContract.greeting()).to.equal('');
      });

      it('should handle very long greeting strings', async () => {
        const longGreeting = 'a'.repeat(1000);
        await yourContract.setGreeting(longGreeting);
        expect(await yourContract.greeting()).to.equal(longGreeting);
      });

      it('should handle special characters', async () => {
        const specialGreeting = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        await yourContract.setGreeting(specialGreeting);
        expect(await yourContract.greeting()).to.equal(specialGreeting);
      });

      it('should handle unicode characters', async () => {
        const unicodeGreeting = 'Hello 👋 世界 🌍';
        await yourContract.setGreeting(unicodeGreeting);
        expect(await yourContract.greeting()).to.equal(unicodeGreeting);
      });

      it('should handle zero wei payment (premium should be false)', async () => {
        await yourContract.setGreeting('Zero payment', { value: 0 });
        expect(await yourContract.premium()).to.equal(false);
      });

      it('should handle 1 wei payment (premium should be true)', async () => {
        await yourContract.setGreeting('One wei', { value: 1 });
        expect(await yourContract.premium()).to.equal(true);
      });
    });
  });

  describe('withdraw', () => {
    beforeEach(async () => {
      // Add some ETH to the contract
      await yourContract.connect(addr1).setGreeting('Premium 1', { value: toWei('1.0') });
      await yourContract.connect(addr2).setGreeting('Premium 2', { value: toWei('0.5') });
    });

    it('should allow owner to withdraw all funds', async () => {
      const contractBalance = await hre.ethers.provider.getBalance(await yourContract.getAddress());
      const ownerBalanceBefore = await hre.ethers.provider.getBalance(owner.address);

      const tx = await yourContract.withdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

      const ownerBalanceAfter = await hre.ethers.provider.getBalance(owner.address);
      const contractBalanceAfter = await hre.ethers.provider.getBalance(await yourContract.getAddress());

      expect(contractBalanceAfter).to.equal(0);
      expect(ownerBalanceAfter).to.equal(ownerBalanceBefore + contractBalance - gasUsed);
    });

    it('should revert when non-owner tries to withdraw', async () => {
      await expect(yourContract.connect(addr1).withdraw())
        .to.be.revertedWith('Not the Owner');
    });

    it('should revert when addr2 tries to withdraw', async () => {
      await expect(yourContract.connect(addr2).withdraw())
        .to.be.revertedWith('Not the Owner');
    });

    it('should allow withdrawal of zero balance', async () => {
      // First withdraw all funds
      await yourContract.withdraw();

      // Try to withdraw again (should succeed but transfer 0)
      await expect(yourContract.withdraw()).to.not.be.reverted;

      const contractBalance = await hre.ethers.provider.getBalance(await yourContract.getAddress());
      expect(contractBalance).to.equal(0);
    });

    it('should handle multiple withdrawals over time', async () => {
      // First withdrawal
      await yourContract.withdraw();
      let contractBalance = await hre.ethers.provider.getBalance(await yourContract.getAddress());
      expect(contractBalance).to.equal(0);

      // Add more funds
      await yourContract.connect(addr1).setGreeting('New premium', { value: toWei('2.0') });

      // Second withdrawal
      await yourContract.withdraw();
      contractBalance = await hre.ethers.provider.getBalance(await yourContract.getAddress());
      expect(contractBalance).to.equal(0);
    });
  });

  describe('receive', () => {
    it('should accept direct ETH transfers', async () => {
      const amount = toWei('1.0');
      await owner.sendTransaction({
        to: await yourContract.getAddress(),
        value: amount,
      });

      const contractBalance = await hre.ethers.provider.getBalance(await yourContract.getAddress());
      expect(contractBalance).to.equal(amount);
    });

    it('should accept multiple direct transfers', async () => {
      const amount1 = toWei('0.5');
      const amount2 = toWei('0.3');

      await addr1.sendTransaction({
        to: await yourContract.getAddress(),
        value: amount1,
      });

      await addr2.sendTransaction({
        to: await yourContract.getAddress(),
        value: amount2,
      });

      const contractBalance = await hre.ethers.provider.getBalance(await yourContract.getAddress());
      expect(contractBalance).to.equal(amount1 + amount2);
    });

    it('should allow owner to withdraw directly transferred ETH', async () => {
      const amount = toWei('1.0');
      await addr1.sendTransaction({
        to: await yourContract.getAddress(),
        value: amount,
      });

      await yourContract.withdraw();
      const contractBalance = await hre.ethers.provider.getBalance(await yourContract.getAddress());
      expect(contractBalance).to.equal(0);
    });
  });

  describe('Access control', () => {
    it('should enforce isOwner modifier on withdraw', async () => {
      await expect(yourContract.connect(addr1).withdraw())
        .to.be.revertedWith('Not the Owner');
    });

    it('should allow only owner to call withdraw', async () => {
      await expect(yourContract.connect(owner).withdraw()).to.not.be.reverted;
    });

    it('should have immutable owner', async () => {
      // Owner should remain the same throughout contract lifetime
      const initialOwner = await yourContract.owner();

      await yourContract.setGreeting('Test');
      await yourContract.connect(addr1).setGreeting('Test 2');

      expect(await yourContract.owner()).to.equal(initialOwner);
    });
  });

  describe('State consistency', () => {
    it('should maintain correct state across multiple operations', async () => {
      // User 1: 2 greetings (1 premium, 1 free)
      await yourContract.connect(addr1).setGreeting('Greeting 1');
      await yourContract.connect(addr1).setGreeting('Greeting 2', { value: toWei('0.5') });

      // User 2: 1 greeting (premium)
      await yourContract.connect(addr2).setGreeting('Greeting 3', { value: toWei('0.3') });

      // Owner: 1 greeting (free)
      await yourContract.connect(owner).setGreeting('Final greeting');

      // Verify counters
      expect(await yourContract.totalCounter()).to.equal(4);
      expect(await yourContract.userGreetingCounter(addr1.address)).to.equal(2);
      expect(await yourContract.userGreetingCounter(addr2.address)).to.equal(1);
      expect(await yourContract.userGreetingCounter(owner.address)).to.equal(1);

      // Verify current state
      expect(await yourContract.greeting()).to.equal('Final greeting');
      expect(await yourContract.premium()).to.equal(false);

      // Verify balance
      const expectedBalance = toWei('0.5') + toWei('0.3');
      const actualBalance = await hre.ethers.provider.getBalance(await yourContract.getAddress());
      expect(actualBalance).to.equal(expectedBalance);
    });

    it('should not affect counters when withdrawal occurs', async () => {
      await yourContract.setGreeting('Test', { value: toWei('1.0') });
      const counterBefore = await yourContract.totalCounter();

      await yourContract.withdraw();

      const counterAfter = await yourContract.totalCounter();
      expect(counterAfter).to.equal(counterBefore);
    });
  });

  describe('Gas optimization checks', () => {
    it('should have reasonable gas costs for setGreeting', async () => {
      const tx = await yourContract.setGreeting('Test greeting');
      const receipt = await tx.wait();

      // Gas usage should be reasonable (adjust threshold as needed)
      // This is mainly for tracking gas changes over time
      expect(receipt!.gasUsed).to.be.lessThan(100000);
    });

    it('should have reasonable gas costs for premium setGreeting', async () => {
      const tx = await yourContract.setGreeting('Premium greeting', { value: toWei('0.1') });
      const receipt = await tx.wait();

      expect(receipt!.gasUsed).to.be.lessThan(100000);
    });

    it('should have reasonable gas costs for withdraw', async () => {
      await yourContract.setGreeting('Fund contract', { value: toWei('1.0') });

      const tx = await yourContract.withdraw();
      const receipt = await tx.wait();

      expect(receipt!.gasUsed).to.be.lessThan(50000);
    });
  });
});

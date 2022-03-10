import { Gravity } from "../typechain/Gravity";
import { TestERC20A } from "../typechain/TestERC20A";
import { TestERC20WNOM } from "../typechain/TestERC20WNOM";
import { ethers } from "hardhat";
import { makeCheckpoint, getSignerAddresses, ZeroAddress } from "./pure";
import { Signer } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

type DeployContractsOptions = {
  corruptSig?: boolean;
};

export async function deployContracts(
  gravityId: string = "foo",
  validators: Signer[],
  powers: number[],
  opts?: DeployContractsOptions
) {
  // enable automining for these tests
  await ethers.provider.send("evm_setAutomine", [true]);

  const TestERC20 = await ethers.getContractFactory("TestERC20A");
  const testERC20 = (await TestERC20.deploy()) as TestERC20A;

  const testERC20WNOMFactory = await ethers.getContractFactory("TestERC20WNOM");
  const testERC20WNOM = (await testERC20WNOMFactory.deploy()) as TestERC20WNOM;

  const Gravity = await ethers.getContractFactory("Gravity");

  const valAddresses = await getSignerAddresses(validators);

  const checkpoint = makeCheckpoint(valAddresses, powers, 0, 0, ZeroAddress, gravityId);

  const gravity = (await Gravity.deploy(
    gravityId,
    await getSignerAddresses(validators),
    powers,
    testERC20WNOM.address
  )) as Gravity;

  await gravity.deployed();

  return { gravity, testERC20, checkpoint, testERC20WNOM };
}

// Insertion Sort for sorting validators
export function sortValidators(validators: SignerWithAddress[]): SignerWithAddress[] {
  // sort the validators by Ascending order
  for (let i = 1; i < validators.length; i++) {
    let currentValidator = validators[i];
    let j = i;

    while (j > 0 && validators[j - 1].address.toLowerCase() > currentValidator.address.toLowerCase()) {
      validators[j] = validators[j - 1];
      j--;
    }

    validators[j] = currentValidator;
  }

  return validators
}


/** Connect to Moralis server */
const serverUrl = "https://y99iqggoorsy.usemoralis.com:2053/server";
const appId = "NCZXyPNnKyW2fkHGro3Bkqhma5UrdSzV1HKqq1rn";

Moralis.start({ serverUrl, appId });
let user = Moralis.User.current();

/** Add from here down */
async function login() {
  if (!user) {
    try {
      user = await Moralis.authenticate({ signingMessage: "Hello World!" })
      initApp();
    } catch (error) {
      console.log(error)
    }
  }
  else {
    Moralis.enableWeb3();
    initApp();
  }
}

function initApp() {
  document.querySelector("#app").style.display = "block";
  document.querySelector("#submit_button").onclick = submit;
}

async function submit() {
  const input = document.querySelector('#input_image');
  let data = input.files[0]
  const imageFile = new Moralis.File(data.name, data)
  await imageFile.saveIPFS();
  let imageHash = imageFile.hash();

  let metadata = {
    name: document.querySelector('#input_name').value,
    description: document.querySelector('#input_description').value,
    image: "/ipfs/" + imageHash
  }
  console.log(metadata);
  const jsonFile = new Moralis.File("metadata.json", { base64: btoa(JSON.stringify(metadata)) });
  await jsonFile.saveIPFS();

  let metadataHash = jsonFile.hash();
  console.log(jsonFile.ipfs())

  let res = await Moralis.Plugins.rarible.lazyMint({
    chain: 'eth',
    userAddress: user.get('ethAddress'),
    tokenType: 'ERC721',
    tokenUri: 'ipfs://' + metadataHash,
    supply: 100,
    royaltiesAmount: 1000, // 10.0% royalty. Optional
  })
  console.log(res);
  document.querySelector('#success_message').innerHTML =
    `NFT minted. <a href="https://rarible.com/token/${res.data.result.tokenAddress}:${res.data.result.tokenId}">View NFT`;
  document.querySelector('#success_message').style.display = "block";
  setTimeout(() => {
    document.querySelector('#success_message').style.display = "none";
  }, 30000)
}

login();
/** Useful Resources  */

// https://docs.moralis.io/moralis-server/users/crypto-login
// https://docs.moralis.io/moralis-server/getting-started/quick-start#user
// https://docs.moralis.io/moralis-server/users/crypto-login#metamask

/** Moralis Forum */

// https://forum.moralis.io/
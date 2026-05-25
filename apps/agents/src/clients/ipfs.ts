export type IpfsPin = {
  cid: string;
  uri: string;
};

export type IpfsPinner = {
  pinJson(name: string, content: unknown): Promise<IpfsPin>;
};

export type IpfsPinnerOptions = {
  jwt: string;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
};

type PinResponse = { IpfsHash?: string };

export function createIpfsPinner(options: IpfsPinnerOptions): IpfsPinner {
  const fetchImpl = options.fetchImpl ?? fetch;
  const baseUrl = options.baseUrl ?? 'https://api.pinata.cloud';

  return {
    async pinJson(name, content) {
      const response = await fetchImpl(`${baseUrl}/pinning/pinJSONToIPFS`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${options.jwt}`,
        },
        body: JSON.stringify({ pinataContent: content, pinataMetadata: { name } }),
      });
      if (!response.ok) {
        throw new Error(`pinata responded ${response.status}`);
      }
      const body = (await response.json()) as PinResponse;
      if (!body.IpfsHash) {
        throw new Error('pinata returned no IpfsHash');
      }
      return { cid: body.IpfsHash, uri: `ipfs://${body.IpfsHash}` };
    },
  };
}

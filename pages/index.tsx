import Head from 'next/head';
import Layout, { siteTitle } from '../components/layout';
import utilStyles from '../styles/utils.module.css';
import useSWR from 'swr';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import bitcoinMessage from 'groestlcoinjs-message';

const addressBalanceFetcher = async (address: string) => {
  if (!address) {
    return {};
  }

  const res = await fetch(`https://esplora.groestlcoin.org/api/address/${address}`);
  return await res.json();
};

export default function Home() {

  const router = useRouter();
  const { a, m, s } = router.query;

  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');
  const [signature, setSignature] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const { data, error }: { data?: any, error?: any } = useSWR(`${address}`, addressBalanceFetcher);

  useEffect(() => {
    verify();
  }, [address, message, signature]);

  useEffect(() => {
    if (a) setAddress(String(a));
    if (m) setMessage(String(m));
    if (s) setSignature(String(s));
    verify();
  }, [a, m, s]);

  const verify = () => {
    setIsVerified(false);
    try {
      router.push(`/?a=${address}&m=${encodeURIComponent(message)}&s=${encodeURIComponent(signature)}`, null, { shallow: true });
      const verified = bitcoinMessage.verify(message, address, signature, null, true);
      console.log({ message, address, signature, verified });
      setIsVerified(verified);

    } catch (error) {
      console.warn(error.message);
    }
  };

  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>

      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>

          <div className="container">

          <form onSubmit={(event) => {
            event.preventDefault();
            verify();
          }}>

              <div className="row">
                  <div className="col">
                      address:
                  </div>
                  <div className="col">
                      <input  type="text" size={29} value={address} onChange={(event) => setAddress(event.target.value)} />
                  </div>
              </div>

              <div className="row">
                  <div className="col">
                      message:
                  </div>
                  <div className="col">
                      <textarea rows={5} cols={30} value={message} onChange={(event) => setMessage(event.target.value)} />
                  </div>
              </div>

              <div className="row">
                  <div className="col">
                      signature:
                  </div>
                  <div className="col">
                      <textarea rows={5} cols={30} value={signature} onChange={(event) => setSignature(event.target.value)} />
                  </div>
              </div>
          </form>

          <br/>

          {data?.chain_stats && (
                  <span>address has <i>{(data?.chain_stats?.funded_txo_sum - data?.chain_stats?.spent_txo_sum) / 100000000} GRS</i></span>
          )}

          <br/>
          <br/>

          {isVerified && (
              <b>Signature verified!</b>
          ) || (
              <i>Signature not verified</i>
          )}
          </div>
      </section>
    </Layout>
  );
}

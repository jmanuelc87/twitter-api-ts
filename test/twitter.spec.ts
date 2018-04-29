import { Twitter } from "../src/twitter";
import { expect } from "chai";
import 'mocha';


describe('Twitter Class', () => {

    let twitter: Twitter;
    let encodedParameters: string;
    let signatureBase: string;

    before(() => {
        twitter = new Twitter("370773112-GmHxMAgYyLbNEtIKZeRNFsMKPR9EyMZeS9weJAEb", "LswwdoUaIvS8ltyTt5jkRh4J50vUPVVHtR2YPi5kE", "xvz1evFS4wEEPTGEFPHBog", "kAcSOqF21Fu85e7zjz7ZN2U4ZRhfV3WpwPAoE3Z7kBw");
    });

    it('should oauth_nonce to be string', () => {
        expect(twitter.buildOAuthNOnce()).to.be.a('string');
    });

    it('should oauth_nonce to have word characters', () => {
        let nonce = twitter.buildOAuthNOnce();
        expect(nonce).to.not.match(/[\=\!\¡\+\?\¿\.\:\,\;\}\{\]\[\*\¨\*\~\`]/);
    });

    it('should build path correctly', () => {
        let params = new Map<string, string>();
        params.set('q', '@noradio');
        params.set('count', '100');
        let path = '/1.1/search/tweets.json';
        let pathWithParams = twitter.buildPath(path, params);
        expect(pathWithParams).to.be.equals(`${path}?count=100&q=%40noradio`);
    });


    it('should join maps correctly', () => {
        let map01 = new Map<string, string>();
        map01.set('a', 'abc');
        map01.set('aa', 'xyz');

        let map02 = new Map<string, string>();
        map02.set('b', 'def');
        map02.set('bb', 'uvw');

        let result = twitter.joinMaps(map01, map02);

        expect(result).to.have.all.keys('a', 'aa', 'b', 'bb');
        expect(result.size).equal(4);
    });


    it('should sort map in alphabetical order', () => {
        let map01 = new Map<string, string>();
        map01.set('a', 'abc');
        map01.set('ac', 'xyz');
        map01.set('zxy', 'abcd');
        map01.set('acf', 'alcd');
        map01.set('ghj', 'abcp');

        let params = twitter.sortMapAlphabetical(map01);

        expect(params).to.be.lengthOf(5);
        expect(params).to.have.ordered.members(['a', 'ac', 'acf', 'ghj', 'zxy']);
    });


    it('should encode map to uri', () => {
        let map = new Map<string, string>();
        map.set('status', 'Hello Ladies + Gentlemen, a signed OAuth request!');
        map.set('include_entities', 'true');
        map.set('oauth_consumer_key', 'xvz1evFS4wEEPTGEFPHBog');
        map.set('oauth_nonce', 'kYjzVBB8Y0ZFabxSWbWovY3uYSQ2pTgmZeNu2VS4cg');
        map.set('oauth_signature_method', 'HMAC-SHA1');
        map.set('oauth_timestamp', '1318622958');
        map.set('oauth_token', '370773112-GmHxMAgYyLbNEtIKZeRNFsMKPR9EyMZeS9weJAEb');
        map.set('oauth_version', '1.0');

        encodedParameters = twitter.encodeMapToQueryString(map);

        expect(encodedParameters).to.be.equals('include_entities=true&oauth_consumer_key=xvz1evFS4wEEPTGEFPHBog&oauth_nonce=kYjzVBB8Y0ZFabxSWbWovY3uYSQ2pTgmZeNu2VS4cg&oauth_signature_method=HMAC-SHA1&oauth_timestamp=1318622958&oauth_token=370773112-GmHxMAgYyLbNEtIKZeRNFsMKPR9EyMZeS9weJAEb&oauth_version=1.0&status=Hello%20Ladies%20%2B%20Gentlemen%2C%20a%20signed%20OAuth%20request%21');
    });

    it('should create the signature base string correctly', () => {
        let method = "post";
        let url = `https://api.twitter.com/1.1/statuses/update.json`;

        signatureBase = twitter.createSignatureBase(method, url, encodedParameters);

        expect(signatureBase).to.be.equal(`POST&https%3A%2F%2Fapi.twitter.com%2F1.1%2Fstatuses%2Fupdate.json&include_entities%3Dtrue%26oauth_consumer_key%3Dxvz1evFS4wEEPTGEFPHBog%26oauth_nonce%3DkYjzVBB8Y0ZFabxSWbWovY3uYSQ2pTgmZeNu2VS4cg%26oauth_signature_method%3DHMAC-SHA1%26oauth_timestamp%3D1318622958%26oauth_token%3D370773112-GmHxMAgYyLbNEtIKZeRNFsMKPR9EyMZeS9weJAEb%26oauth_version%3D1.0%26status%3DHello%2520Ladies%2520%252B%2520Gentlemen%252C%2520a%2520signed%2520OAuth%2520request%2521`);
    });

    it('should calculate the hash signature correct', () => {
        let hash = twitter.generateHashSignature(signatureBase);
        expect(hash).to.be.equal('hCtSmYh+iHYCEqBWrE7C7hYmtUk=');
    });

    
});
const SHA256 = require('crypto-js/sha256');

class Block {
    constructor(index, timestamp, nonce, hash, previous_hash) {
        /**
         * Deklarasi block baru dengan data yang diberikan di parameter
         * 
         * @params int index, str data, str timestamp, str nonce, str hash, str previous_hash
         * @return void
         * 
         */
        this.index = index;
        this.timestamp = timestamp;
        this.nonce = nonce;
        this.hash = hash;
        this.previous_hash = previous_hash;
    }

    validateBlock(block, block_from_blockchain) {
        /**
         * Cek kebenaran block
         * 
         * @params Block block, Block block_from_blockchain
         * @return int
         * 
         */


        //check index
        if (block_from_blockchain.index + 1 != block.index) {
            return 1;
        }

        //check nonce
        var pattern = Math.pow((2*block.index),3);
        var string_pattern = pattern.toString();
        var hash_pattern = SHA256(string_pattern).toString(); //hash_pattern = salt
        var real_block_nonce = SHA256(hash_pattern).toString();
    
        if (real_block_nonce != block.nonce) {
            return 2;
        }
        
        //check hash
        var real_hash = SHA256(block.index.toString() + block.timestamp + block.nonce + block.previous_hash).toString();
        if (real_hash != block.hash) {
            return 3;
        }

        //check previous hash
        if (block_from_blockchain.hash != block.previous_hash) {
            return 4;
        }

        return 0;
    }
}

module.exports = Block;
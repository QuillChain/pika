near-ft-transfer
==================

This [React] app was initialized with [create-near-app]


Quick Start
===========
- dev
   - dev-1637682800749-94703729978601
- testnet
   - ft.happybits.testnet

- setup
   - export ID=dev-1637682800749-94703729978601
   - near call $ID new '{"owner_id": "'$ID'", "total_supply": "1000000000000000", "metadata": { "spec": "ft-1.0.0", "name": "MEME Token", "symbol": "MEME", "decimals": 8 }}' --accountId $ID
   - near view $ID ft_metadata
   - near view $ID ft_balance_of '{"account_id": "'$ID'"}'
   - near call $ID storage_deposit '{}' --accountId $ID

pragma solidity >=0.4.22 <0.9.0;

contract QkToken{

    string public name = 'QK Token';
    string public symbol = 'QK';
    string public standard = 'QK Token v1.0';
    //numbers of tokens. Name is because the ERC-20 standard
    //allocate the initial supply.
    uint256 public totalSupply;

    // Defined on eip-20
    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );
    //approval event
    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    mapping(address => uint256) public balanceOf;
    //allowante
    //have a record of the account that approves, the acount that spends and the spent amount
    mapping(address => mapping(address => uint256)) public allowance;

    // constructor
    constructor(uint256 _initialSupply) public {
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
    }

    //transfer
    function transfer(address _to, uint256 _value) public returns(bool success){
        require(balanceOf[msg.sender] >= _value);
        //transfer the balance
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        // transfer event (according docs every transfer should trigger a Transfer event)
        emit Transfer(msg.sender, _to, _value);

        return true;
    }

    // Delegated transfer
    //acount A approve B to spend on its behalf some tokens

    //approve
    function approve(address _spender, uint256 _value) public returns (bool success){
        //allowance
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    //transferFrom
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success){
        require(_value <= balanceOf[_from]);
        require(_value <= allowance[_from][msg.sender]);
        emit Transfer(_from, _to, _value);
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;
        return true;
    }
}

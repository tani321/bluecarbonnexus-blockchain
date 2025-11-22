// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract CarbonCreditRegistryV2 {
    // Structure to store project information
    struct Project {
        uint256 id;
        string name;
        string location;
        address owner;
        uint256 areaInHectares;
        uint256 carbonCredits;
        bool isActive;
        uint256 registrationDate;
    }
    
    // Structure to store IoT sensor data
    struct SensorData {
        uint256 projectId;
        uint256 co2Absorbed;      // in kg
        uint256 temperature;       // in Celsius * 100 (to avoid decimals)
        uint256 humidity;          // percentage * 100
        uint256 timestamp;
        string sensorId;
    }
    
    // Structure to store credit balance per user
    struct CreditBalance {
        uint256 totalCredits;
        uint256 availableCredits;
        uint256 usedCredits;
    }
    
    // State variables
    address public admin;
    uint256 public projectCounter;
    uint256 public sensorDataCounter;
    uint256 public pricePerCredit;  // Price in wei
    
    // Mappings
    mapping(uint256 => Project) public projects;
    mapping(uint256 => SensorData) public sensorDataRecords;
    mapping(address => CreditBalance) public creditBalances;
    mapping(uint256 => uint256[]) public projectSensorData; // projectId => array of sensor data IDs
    
    // Events
    event ProjectRegistered(
        uint256 indexed projectId,
        string name,
        address owner,
        uint256 areaInHectares
    );
    
    event CreditsIssued(
        uint256 indexed projectId,
        address indexed owner,
        uint256 amount,
        uint256 totalCredits
    );
    
    event CreditsTransferred(
        address indexed from,
        address indexed to,
        uint256 amount
    );
    
    event SensorDataRecorded(
        uint256 indexed dataId,
        uint256 indexed projectId,
        uint256 co2Absorbed,
        string sensorId
    );
    
    event CreditPriceUpdated(
        uint256 oldPrice,
        uint256 newPrice
    );
    
    // Modifiers
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }
    
    modifier projectExists(uint256 _projectId) {
        require(projects[_projectId].id != 0, "Project does not exist");
        _;
    }
    
    // Constructor
    constructor() {
        admin = msg.sender;
        projectCounter = 0;
        sensorDataCounter = 0;
        pricePerCredit = 0.01 ether; // Default price: 0.01 ETH per credit
    }
    
    // Register a new mangrove conservation project
    function registerProject(
        string memory _name,
        string memory _location,
        address _owner,
        uint256 _areaInHectares
    ) public onlyAdmin returns (uint256) {
        projectCounter++;
        
        projects[projectCounter] = Project({
            id: projectCounter,
            name: _name,
            location: _location,
            owner: _owner,
            areaInHectares: _areaInHectares,
            carbonCredits: 0,
            isActive: true,
            registrationDate: block.timestamp
        });
        
        emit ProjectRegistered(projectCounter, _name, _owner, _areaInHectares);
        
        return projectCounter;
    }
    
    // Record IoT sensor data
    function recordSensorData(
        uint256 _projectId,
        uint256 _co2Absorbed,
        uint256 _temperature,
        uint256 _humidity,
        string memory _sensorId
    ) public onlyAdmin projectExists(_projectId) returns (uint256) {
        sensorDataCounter++;
        
        sensorDataRecords[sensorDataCounter] = SensorData({
            projectId: _projectId,
            co2Absorbed: _co2Absorbed,
            temperature: _temperature,
            humidity: _humidity,
            timestamp: block.timestamp,
            sensorId: _sensorId
        });
        
        // Add to project's sensor data array
        projectSensorData[_projectId].push(sensorDataCounter);
        
        emit SensorDataRecorded(sensorDataCounter, _projectId, _co2Absorbed, _sensorId);
        
        return sensorDataCounter;
    }
    
    // Issue carbon credits to a project (and its owner)
    function issueCredits(uint256 _projectId, uint256 _amount) 
        public 
        onlyAdmin 
        projectExists(_projectId) 
    {
        require(projects[_projectId].isActive, "Project is not active");
        require(_amount > 0, "Credit amount must be greater than 0");
        
        Project storage project = projects[_projectId];
        address owner = project.owner;
        
        // Update project credits
        project.carbonCredits += _amount;
        
        // Update owner's credit balance
        creditBalances[owner].totalCredits += _amount;
        creditBalances[owner].availableCredits += _amount;
        
        emit CreditsIssued(_projectId, owner, _amount, project.carbonCredits);
    }
    
    // Transfer credits from one user to another
    function transferCredits(address _to, uint256 _amount) public {
        require(_to != address(0), "Cannot transfer to zero address");
        require(_amount > 0, "Amount must be greater than 0");
        require(
            creditBalances[msg.sender].availableCredits >= _amount,
            "Insufficient available credits"
        );
        
        // Deduct from sender
        creditBalances[msg.sender].availableCredits -= _amount;
        
        // Add to receiver
        creditBalances[_to].totalCredits += _amount;
        creditBalances[_to].availableCredits += _amount;
        
        emit CreditsTransferred(msg.sender, _to, _amount);
    }
    
    // Buy credits (simplified - in real world would involve payment)
    function buyCredits(address _from, uint256 _amount) public payable {
        require(_amount > 0, "Amount must be greater than 0");
        require(
            creditBalances[_from].availableCredits >= _amount,
            "Seller doesn't have enough credits"
        );
        
        uint256 totalPrice = _amount * pricePerCredit;
        require(msg.value >= totalPrice, "Insufficient payment");
        
        // Transfer credits
        creditBalances[_from].availableCredits -= _amount;
        creditBalances[msg.sender].totalCredits += _amount;
        creditBalances[msg.sender].availableCredits += _amount;
        
        // Transfer payment to seller
        payable(_from).transfer(totalPrice);
        
        // Refund excess payment
        if (msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }
        
        emit CreditsTransferred(_from, msg.sender, _amount);
    }
    
    // Mark credits as used (for carbon offsetting)
    function useCredits(uint256 _amount) public {
        require(_amount > 0, "Amount must be greater than 0");
        require(
            creditBalances[msg.sender].availableCredits >= _amount,
            "Insufficient available credits"
        );
        
        creditBalances[msg.sender].availableCredits -= _amount;
        creditBalances[msg.sender].usedCredits += _amount;
    }
    
    // Get project details
    function getProject(uint256 _projectId) public view returns (
        uint256 id,
        string memory name,
        string memory location,
        address owner,
        uint256 areaInHectares,
        uint256 carbonCredits,
        bool isActive,
        uint256 registrationDate
    ) {
        Project memory p = projects[_projectId];
        return (
            p.id,
            p.name,
            p.location,
            p.owner,
            p.areaInHectares,
            p.carbonCredits,
            p.isActive,
            p.registrationDate
        );
    }
    
    // Get sensor data
    function getSensorData(uint256 _dataId) public view returns (
        uint256 projectId,
        uint256 co2Absorbed,
        uint256 temperature,
        uint256 humidity,
        uint256 timestamp,
        string memory sensorId
    ) {
        SensorData memory data = sensorDataRecords[_dataId];
        return (
            data.projectId,
            data.co2Absorbed,
            data.temperature,
            data.humidity,
            data.timestamp,
            data.sensorId
        );
    }
    
    // Get all sensor data IDs for a project
    function getProjectSensorDataIds(uint256 _projectId) 
        public 
        view 
        returns (uint256[] memory) 
    {
        return projectSensorData[_projectId];
    }
    
    // Get credit balance for an address
    function getCreditBalance(address _user) public view returns (
        uint256 totalCredits,
        uint256 availableCredits,
        uint256 usedCredits
    ) {
        CreditBalance memory balance = creditBalances[_user];
        return (balance.totalCredits, balance.availableCredits, balance.usedCredits);
    }
    
    // Get total projects
    function getTotalProjects() public view returns (uint256) {
        return projectCounter;
    }
    
    // Get total sensor data records
    function getTotalSensorData() public view returns (uint256) {
        return sensorDataCounter;
    }
    
    // Update credit price
    function setCreditPrice(uint256 _newPrice) public onlyAdmin {
        uint256 oldPrice = pricePerCredit;
        pricePerCredit = _newPrice;
        emit CreditPriceUpdated(oldPrice, _newPrice);
    }
    
    // Deactivate a project
    function deactivateProject(uint256 _projectId) 
        public 
        onlyAdmin 
        projectExists(_projectId) 
    {
        projects[_projectId].isActive = false;
    }
}
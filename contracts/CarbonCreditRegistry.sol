// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract CarbonCreditRegistry {
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
    
    // State variables
    address public admin;
    uint256 public projectCounter;
    
    // Mapping from project ID to Project
    mapping(uint256 => Project) public projects;
    
    // Events (for logging on blockchain)
    event ProjectRegistered(
        uint256 indexed projectId,
        string name,
        address owner,
        uint256 areaInHectares
    );
    
    event CreditsIssued(
        uint256 indexed projectId,
        uint256 amount,
        uint256 totalCredits
    );
    
    // Modifier: Only admin can call
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }
    
    // Constructor: Sets deployer as admin
    constructor() {
        admin = msg.sender;
        projectCounter = 0;
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
    
    // Issue carbon credits to a project
    function issueCredits(uint256 _projectId, uint256 _amount) public onlyAdmin {
        require(projects[_projectId].isActive, "Project is not active");
        require(_amount > 0, "Credit amount must be greater than 0");
        
        projects[_projectId].carbonCredits += _amount;
        
        emit CreditsIssued(_projectId, _amount, projects[_projectId].carbonCredits);
    }
    
    // Get project details
    function getProject(uint256 _projectId) public view returns (
        uint256 id,
        string memory name,
        string memory location,
        address owner,
        uint256 areaInHectares,
        uint256 carbonCredits,
        bool isActive
    ) {
        Project memory p = projects[_projectId];
        return (
            p.id,
            p.name,
            p.location,
            p.owner,
            p.areaInHectares,
            p.carbonCredits,
            p.isActive
        );
    }
    
    // Get total projects registered
    function getTotalProjects() public view returns (uint256) {
        return projectCounter;
    }
    
    // Deactivate a project
    function deactivateProject(uint256 _projectId) public onlyAdmin {
        require(projects[_projectId].id != 0, "Project does not exist");
        projects[_projectId].isActive = false;
    }
}

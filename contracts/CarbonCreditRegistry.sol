// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract CarbonCreditRegistry is ERC1155, Ownable {
    using Strings for uint256;
    
    uint256 public nextProjectId = 1;
    uint256 public nextCreditId = 1;
    
    struct Project {
        uint256 projectId;
        string name;
        string location;
        uint256 area;
        address owner;
        uint256 totalCreditsIssued;
        bool isActive;
        uint256 registeredAt;
    }
    
    struct CarbonCredit {
        uint256 creditId;
        uint256 projectId;
        uint256 amount;
        uint256 issuedAt;
        string verificationHash;
        bool isRetired;
    }
    
    mapping(uint256 => Project) public projects;
    mapping(uint256 => CarbonCredit) public credits;
    mapping(address => uint256[]) public userProjects;
    
    event ProjectRegistered(uint256 indexed projectId, string name, address owner);
    event CreditsIssued(uint256 indexed creditId, uint256 projectId, uint256 amount);
    event CreditsTransferred(address indexed from, address indexed to, uint256 creditId, uint256 amount);
    event CreditsRetired(uint256 indexed creditId, uint256 amount, address by);
    
    constructor() ERC1155("https://bluecarbonnexus.com/api/token/{id}.json") Ownable(msg.sender) {}
    
    function registerProject(
        string memory _name,
        string memory _location,
        uint256 _area
    ) public returns (uint256) {
        uint256 projectId = nextProjectId++;
        
        projects[projectId] = Project({
            projectId: projectId,
            name: _name,
            location: _location,
            area: _area,
            owner: msg.sender,
            totalCreditsIssued: 0,
            isActive: true,
            registeredAt: block.timestamp
        });
        
        userProjects[msg.sender].push(projectId);
        
        emit ProjectRegistered(projectId, _name, msg.sender);
        return projectId;
    }
    
    function issueCredits(
        uint256 _projectId,
        uint256 _amount,
        string memory _verificationHash
    ) public returns (uint256) {
        require(projects[_projectId].isActive, "Project not active");
        require(
            projects[_projectId].owner == msg.sender || owner() == msg.sender,
            "Not authorized"
        );
        
        uint256 creditId = nextCreditId++;
        
        credits[creditId] = CarbonCredit({
            creditId: creditId,
            projectId: _projectId,
            amount: _amount,
            issuedAt: block.timestamp,
            verificationHash: _verificationHash,
            isRetired: false
        });
        
        projects[_projectId].totalCreditsIssued += _amount;
        
        _mint(projects[_projectId].owner, creditId, _amount, "");
        
        emit CreditsIssued(creditId, _projectId, _amount);
        return creditId;
    }
    
    function transferCredits(
        address _to,
        uint256 _creditId,
        uint256 _amount
    ) public {
        require(!credits[_creditId].isRetired, "Credits already retired");
        require(balanceOf(msg.sender, _creditId) >= _amount, "Insufficient balance");
        
        safeTransferFrom(msg.sender, _to, _creditId, _amount, "");
        
        emit CreditsTransferred(msg.sender, _to, _creditId, _amount);
    }
    
    function retireCredits(uint256 _creditId, uint256 _amount) public {
        require(balanceOf(msg.sender, _creditId) >= _amount, "Insufficient balance");
        require(!credits[_creditId].isRetired, "Already retired");
        
        _burn(msg.sender, _creditId, _amount);
        
        if (balanceOf(msg.sender, _creditId) == 0) {
            credits[_creditId].isRetired = true;
        }
        
        emit CreditsRetired(_creditId, _amount, msg.sender);
    }
    
    function getProject(uint256 _projectId) public view returns (Project memory) {
        return projects[_projectId];
    }
    
    function getCredit(uint256 _creditId) public view returns (CarbonCredit memory) {
        return credits[_creditId];
    }
    
    function getUserProjects(address _user) public view returns (uint256[] memory) {
        return userProjects[_user];
    }
    
    function getCreditBalance(address _user, uint256 _creditId) public view returns (uint256) {
        return balanceOf(_user, _creditId);
    }
}
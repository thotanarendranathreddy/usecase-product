pragma solidity ^0.4.6;

contract ARTICAL

{

    struct Product{
        string Title;
        string BatchNo;
        string LicNo;
        string NetWeight;
        string Price;
        string Company;
        string Status1;
        uint createDate;
        uint updateDate;
    }

    mapping(uint => Product) Total;
    uint8 Count=0;

    function addNewProduct(string Title, string BatchNo,string LicNo, string NetWeight, string Price, string Company,string  Status1)
    {

        Product memory newProduct;
        newProduct.Title= Title;
        newProduct.BatchNo= BatchNo;
        newProduct.LicNo= LicNo;
        newProduct.NetWeight= NetWeight;
        newProduct.Price= Price;
        newProduct.Company= Company;
        newProduct.Status1= Status1;
        newProduct.createDate = now;
        newProduct.updateDate = now;
        Total[Count] = newProduct;
        Count++;

    }

    function updateProduct(uint8 CountNo, string Status1)
    {

        Total[CountNo].Status1= Status1;
        Total[CountNo].updateDate = now;

    }


    function GetCount() returns(uint8){
        return Count;
    }

    function getProduct(uint8 CountNo) returns (string, string ,string , string , string , string, string )
    {
        return (Total[CountNo].Title, Total[CountNo].BatchNo,Total[CountNo].LicNo,Total[CountNo].NetWeight,Total[CountNo].Price,Total[CountNo].Company, Total[CountNo].Status1);
    }
}

import * as AWS from 'aws-sdk'
import {DocumentClient} from "aws-sdk/lib/dynamodb/document_client";
import QueryOutput = DocumentClient.QueryOutput;
import QueryInput = DocumentClient.QueryInput;
import ScanInput = DocumentClient.ScanInput;
import ScanOutput = DocumentClient.ScanOutput;

const dynamodb = new AWS.DynamoDB.DocumentClient();

// polyfill
if (Symbol["asyncIterator"] === undefined) ((Symbol as any)["asyncIterator"]) = Symbol.for("asyncIterator");

/**
 * Iterate over the results of a DynamoDB Query or Scan
 *
 * @param {DocumentClient.QueryInput | DocumentClient.ScanInput} params
 * @param {string} queryType
 * @returns {Promise<DocumentClient.AttributeMap>}
 */
export async function* queryIterator(params: QueryInput | ScanInput, queryType = 'query') {
    while (true) {

        let response = queryType === 'query'
            ? <QueryOutput> await dynamodb.query(params).promise()
            : <ScanOutput> await dynamodb.scan(params).promise();

        if (response.Items) {
            for (let item of response.Items) {
                yield item;
            }
        }

        if (!response.LastEvaluatedKey) return;

        params.ExclusiveStartKey = response.LastEvaluatedKey;
    }
}

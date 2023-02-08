import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeApiError,
	NodeOperationError,
} from 'n8n-workflow';
import {
	generateCreditCard,
	generateNanoid,
	generateRandomAddress,
	generateRandomEmail,
	generateRandomUser,
	generateUUID,
} from './randomData';
import { setSeed, array as mfArray } from 'minifaker';
import { generateGarbageMemory, runGarbageCollector } from './functions';

export class DebugHelper implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'DebugHelper',
		name: 'debugHelper',
		icon: 'file:DebugHelper.svg',
		group: ['output'],
		subtitle: '={{$parameter["category"] + ": " + $parameter["operation"]}}',
		description: 'Causes problems intentionally',
		version: 1,
		defaults: {
			name: 'DebugHelper',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [],
		properties: [
			{
				displayName: 'Category',
				name: 'category',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Do Nothing',
						value: 'doNothing',
						description: 'Does nothing',
					},
					{
						name: 'Throw Error',
						value: 'throwError',
						description: 'Throws an error with the specified type and message',
					},
					{
						name: 'Out Of Memory',
						value: 'oom',
						description: 'Generates a large amount of memory to cause an out of memory error',
					},
					{
						name: 'Generate Random Data',
						value: 'randomData',
						description: 'Generates random data sets',
					},
				],
				default: 'throwError',
			},
			{
				displayName: 'Error Type',
				name: 'throwErrorType',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'NodeApiError',
						value: 'NodeApiError',
					},
					{
						name: 'NodeOperationError',
						value: 'NodeOperationError',
					},
					{
						name: 'Error',
						value: 'Error',
					},
				],
				default: 'NodeApiError',
				displayOptions: {
					show: {
						category: ['throwError'],
					},
				},
			},
			{
				displayName: 'Error Message',
				name: 'throwErrorMessage',
				type: 'string',
				default: 'Node has thrown an error',
				description: 'The message to send as part of the error',
				noDataExpression: true,
				displayOptions: {
					show: {
						category: ['throwError'],
					},
				},
			},
			{
				displayName: 'Memory Size to Generate',
				name: 'memorySizeValue',
				type: 'number',
				default: 10,
				description: 'The approximate amount of memory to generate. Be generous...',
				noDataExpression: true,
				displayOptions: {
					show: {
						category: ['oom'],
					},
				},
			},
			{
				displayName: 'Data Type',
				name: 'randomDataType',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'User Data',
						value: 'user',
					},
					{
						name: 'Email',
						value: 'email',
					},
					{
						name: 'Address',
						value: 'address',
					},
					{
						name: 'Credit Card',
						value: 'creditCard',
					},
					{
						name: 'UUIDs',
						value: 'uuid',
					},
					{
						name: 'NanoIds',
						value: 'nanoid',
					},
				],
				default: 'user',
				displayOptions: {
					show: {
						category: ['randomData'],
					},
				},
			},
			{
				displayName: 'Seed',
				name: 'randomDataSeed',
				type: 'string',
				default: '',
				description:
					'If set, seed to use for generating the data (same seed will generate the same data)',
				noDataExpression: true,
				displayOptions: {
					show: {
						category: ['randomData'],
					},
				},
			},
			{
				displayName: 'Number of Items to Generate',
				name: 'randomDataCount',
				type: 'number',
				default: 10,
				description: 'The number of random data items to generate into an array',
				noDataExpression: true,
				displayOptions: {
					show: {
						category: ['randomData'],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const category = this.getNodeParameter('category', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				switch (category) {
					case 'doNothing':
						// as it says on the tin...
						break;
					case 'throwError':
						const throwErrorType = this.getNodeParameter('throwErrorType', 0) as string;
						const throwErrorMessage = this.getNodeParameter('throwErrorMessage', 0) as string;
						switch (throwErrorType) {
							case 'NodeApiError':
								throw new NodeApiError(
									this.getNode(),
									{ message: throwErrorMessage },
									{ message: throwErrorMessage },
								);
							case 'NodeOperationError':
								throw new NodeOperationError(this.getNode(), throwErrorMessage, {
									message: throwErrorMessage,
								});
							case 'Error':
								// eslint-disable-next-line n8n-nodes-base/node-execute-block-wrong-error-thrown
								throw new Error(throwErrorMessage);
							default:
								break;
						}
					case 'oom':
						const memorySizeValue = this.getNodeParameter('memorySizeValue', 0) as number;
						runGarbageCollector();
						const memUsed = generateGarbageMemory(memorySizeValue);
						items[i].json = memUsed;
						returnData.push(items[i]);
						break;
					case 'randomData':
						const randomDataType = this.getNodeParameter('randomDataType', 0) as string;
						const randomDataCount = this.getNodeParameter('randomDataCount', 0) as number;
						const randomDataSeed = this.getNodeParameter('randomDataSeed', 0) as string;
						const newItem: INodeExecutionData = {
							json: {},
							pairedItem: items[i].pairedItem,
						};
						setSeed(randomDataSeed);

						let randomFn: () => any = generateRandomUser;
						switch (randomDataType) {
							case 'user':
								randomFn = generateRandomUser;
								break;
							case 'email':
								randomFn = generateRandomEmail;
								break;
							case 'address':
								randomFn = generateRandomAddress;
								break;
							case 'creditCard':
								randomFn = generateCreditCard;
								break;
							case 'uuid':
								randomFn = generateUUID;
								break;
							case 'nanoid':
								randomFn = generateNanoid;
								break;
						}
						const generatedItems = mfArray(randomDataCount, randomFn);
						newItem.json = { generatedItems };
						returnData.push(newItem);
						break;
					default:
						break;
				}
			} catch (error) {
				console.log(error);
				if (this.continueOnFail()) {
					returnData.push({ error: error.message, json: {}, itemIndex: i });
					continue;
				}
				throw error;
			}
		}
		return this.prepareOutputData(returnData);
	}
}

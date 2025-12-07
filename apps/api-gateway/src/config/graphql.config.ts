import { GraphQLFormattedError } from 'graphql';

export const formatError = (error: GraphQLFormattedError) => {
  const graphQLFormattedError = {
    message:
      (error.extensions?.exception as any)?.response?.message ||
      (error.extensions?.response as any)?.message ||
      error.message ||
      'Internal server error',
    statusCode:
      (error.extensions?.exception as any)?.response?.statusCode ||
      (error.extensions?.response as any)?.statusCode ||
      error.extensions?.statusCode ||
      500,
    success: false,
    errors: [error.message],
  };

  if (error.message === 'Unauthorized') {
    graphQLFormattedError.statusCode = 401;
    graphQLFormattedError.message = 'Unauthorized';
  }

  if (error.message === 'Forbidden resource') {
    graphQLFormattedError.statusCode = 403;
    graphQLFormattedError.message = 'Forbidden resource';
  }

  const { statusCode } = graphQLFormattedError;

  if (statusCode === 401) {
    graphQLFormattedError.message = 'Unauthorized';
  }

  if (statusCode === 403) {
    graphQLFormattedError.message = 'Forbidden resource';
  }

  return graphQLFormattedError;
};
